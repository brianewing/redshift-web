import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

import basicContext from 'basiccontext'

import Header from './header'
import Modal from './modal'

import About from './routes/about'
import Remote from './routes/remote'
import Effects from './routes/effects'
import Scripts from './routes/scripts/index'

import Config from '../config'
import Connection from '../connection'

const HOST = Config.host
const WS_URL = `ws://${HOST}:9191`
const SCRIPTS_URL = `http://${HOST}:9292`

const BUFFER_FPS = 60

let ws2812_ComponentPower = (c) => (c / 255) * 0.02 // 20mA per color channel on full brightness

export default class App extends Component {
	componentWillMount() {
		//window.addEventListener('blur', this.turnOff)
		//window.addEventListener('focus', this.turnOn)
		window.app = this
		this.openConnection()
	}

	componentWillUnmount() {
		window.removeEventListener('blur', this.turnOff)
		window.removeEventListener('focus', this.turnOn)
		this.closeConnection()
	}

	showMenu = (e) => {
		let go = (url) => () => route(url)
		basicContext.show([
			{title: 'Cinema', fn: go('/')},
			{title: 'Effects', fn: go('/effects')},
			{title: 'Script Editor', fn: go('/scripts')},
			{},
			{title: 'Change Server', fn: () => alert('Not implemented yet')},
			{title: (this.state.off ? 'Connect' : 'Disconnect'), fn: this.toggleOff},
			{title: 'Refresh', fn: () => window.location = window.location},
		], e)
	}

	toggleOff = (e) => { // closes all server connections
		this.state.off ? this.turnOn() : this.turnOff()
	}

	turnOn = (e) => { this.setState({off: false}) }
	turnOff = (e) => { this.setState({off: true}) }

	toggleHeader = () => { this.setState({hideHeader: !this.state.hideHeader}) }

	/* Events */

	handleRoute = (e) => {
		this.setState({ currentUrl: e.url })
	}

	onVisibilityChange = (e) => {
		this.setState({hide: document.hidden})
	}

	onConnectionClose = (e) => {
		this.setState({ connected: false, stream: null })
		this.connection = null
		this.connectionPromise = null

		if(!e.wasClean) {
			console.log('Connection break', e)
			setTimeout(() => this.openConnection(), this.reconnectDelay)
		}
	}

	/* Server communication */

	reconnectDelay = 250 // ms

	openConnection() {
		if(!this.connectionPromise) {
			this.connection = new Connection(WS_URL)
			this.connection.onClose = this.onConnectionClose

			this.connectionPromise = this.connection.connect()
				.then(() => this.openStream())
				.then(() => this.setState({ connected: true }))
		}
		return this.connectionPromise
	}

	openStream() {
		return this.connection.openStream('strip').then((stream) => {
			this.setState({ stream: stream })
			stream.setFps(BUFFER_FPS)
		})
	}

	closeConnection() {
		if(this.connection)
			this.connection.close()
	}

	/* Rendering */

	calculateAmps = (buffer) => {
		let amps = 0
		for(let i=0; i<buffer.length; i++) {
			let [ r, g, b ] = buffer[i]
			amps += (ws2812_ComponentPower(r) + ws2812_ComponentPower(g) + ws2812_ComponentPower(b))
		}
		return amps.toFixed(2)
	}

	render({ }, { currentUrl, connected, stream, amps, off, hideHeader }) {
		return (
			<div id="app">
				<Header hide={hideHeader} stream={stream} onTitleClick={this.showMenu} toggleOff={this.toggleOff} off={off}></Header>

				<main id="main">
					{ !connected && !off ? <Modal>Connecting...</Modal> : null }

					<Router onChange={this.handleRoute}>
						<About path="/about" />
						<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
						<Effects path="/effects" stream={stream} />
						<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
					</Router>
				</main>
			</div>
		);
	}
}
