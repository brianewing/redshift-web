import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

import ViewSlider from 'react-view-slider';

import basicContext from 'basiccontext'

import Header from './header'
import Modal from './modal'

import LEDStrip from '../components/led-strip'

import About from './routes/about'
import Remote from './routes/remote'
import Effects from './routes/effects'
import Scripts from './routes/scripts/index'

import Config from '../config'
import Connection from '../connection'

const HOST = Config.host
const WS_URL = `ws://${HOST}:9191`
const SCRIPTS_URL = `http://${HOST}:9292`

const BUFFER_FPS = 30

export default class App extends Component {
	componentWillMount() {
		this.openConnection()
		window.app = this
	}

	componentWillUnmount() {
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

	turnOn = (e) => {
		this.setState({off: false})
		this.openConnection()
	}

	turnOff = (e) => {
		this.setState({off: true})
		this.closeConnection()
	}

	toggleHeader = () => { this.setState({hideHeader: !this.state.hideHeader}) }

	/* Events */

	handleRoute = (e) => {
		this.setState({ currentUrl: e.url })
	}

	onVisibilityChange = (e) => {
		this.setState({hide: document.hidden})
	}

	onConnectionWelcome = (serverWelcome) => {
		this.setState({ serverWelcome })
	}

	onConnectionClose = (e) => {
		this.connection = null
		this.connectionPromise = null

		this.setState({
			// serverWelcome: null,
			connected: false,
			stream: null,
		})

		if(!e.wasClean) {
			console.error('Connection break', e)
			setTimeout(() => this.openConnection(), this.reconnectDelay)
		}
	}

	/* Server communication */

	reconnectDelay = 250 // ms

	openConnection() {
		if(!this.connectionPromise) {
			this.connection = new Connection(WS_URL)
			this.connection.onClose = this.onConnectionClose
			this.connection.onWelcome = this.onConnectionWelcome

			this.connectionPromise = this.connection.connect()
				.then(() => this.setState({ connected: true }))
				.then(() => this.openStream())
		}
		return this.connectionPromise
	}

	closeConnection() {
		if(this.connection)
			this.connection.close()
	}

	openStream() {
		return this.connection.openStream('strip').then((stream) => {
			this.setState({ stream: stream })
			stream.setFps(BUFFER_FPS)
		})
	}

	/* Rendering */

	calculateAmps = (buffer) => {
		const { ws2812_ComponentPower } = this
		let amps = 0
		for(let i=0; i<buffer.length; i++) {
			let [ r, g, b ] = buffer[i]
			amps += (ws2812_ComponentPower(r) + ws2812_ComponentPower(g) + ws2812_ComponentPower(b))
		}
		return amps.toFixed(2)
	}

	pageTitle = () => {
		const firstSegment = (this.state.currentUrl || '').split('/')[1] || ''
		return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)
	}

	render({ }, { currentUrl, title, serverWelcome, connected, off, stream, amps, hideHeader }) {
		return (
			<div id="app">
				<Header pageTitle={this.pageTitle()} hide={hideHeader} onTitleClick={this.showMenu} onPowerToggle={this.toggleOff}></Header>

				{ stream && <LEDStrip stream={stream} paused={off} /> }

				<Router onChange={this.handleRoute}></Router>

				{ serverWelcome
					? <ViewSlider
							renderView={this.renderView}
							numViews={4}
							activeView={this.activeView()}
							animateHeight
						/>
					: <Modal>Connecting...</Modal> }
			</div>
		);
	}

	activeView = () => {
		const url = this.state.currentUrl

		switch(true) {
			case url.startsWith("/about"): return 0
			case url.startsWith("/effects"): return 2
			case url.startsWith("/scripts"): return 3
			case url.startsWith("/") || url.startsWith("/cinema"): return 1
		}
	}

	renderView = ({ index, key, ref, style, className, active, transitionState }) => {
		return <main id="main" key={key} ref={ref} style={style} className={className}>
			{this.renderViewByNum(index)}
		</main>
	}

	renderViewByNum(index) {
		const { serverWelcome, stream } = this.state

		switch(index) {
			case 0:
				return <About path="/about/:page?" serverWelcome={serverWelcome} />
			case 1:
				return <div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
			case 2:
				const selection = this.state.currentUrl.split("/")[2]
				return <Effects path="/effects/:selection?" selection={selection} stream={stream} />
			case 3:
				return <Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
		}
	}
}
