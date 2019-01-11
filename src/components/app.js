import { h, cloneElement, Component } from 'preact'
import { Router, route } from 'preact-router'

import basicContext from 'basiccontext'

import Header from './header'
import Modal from './modal'

import LEDStrip from '../components/led-strip'

import About from './routes/about'
import Effects from './routes/effects'
import Modes from './routes/modes'
import Scripts from './routes/scripts/index'
import Repl from './routes/repl/index'
import Settings from './routes/settings/index'

import Config from '../config'
import Connection from '../connection'

const HOST = Config.host
const WS_URL = `ws://${HOST}:9191`
const SCRIPTS_URL = `http://${HOST}:9292`

const BUFFER_FPS = 60

const clientInfo = {
	AppType: 0, // redshift app
	AppVersionMajor: 1,
	AppVersionMinor: 5,
	DeviceName: "Brian's Laptop",
}

export default class App extends Component {
	componentWillMount() {
		window.app = this
		this.openConnection()
		document.addEventListener('keydown', this.handleKeyDown)
	}

	componentWillUnmount() {
		this.closeConnection()
		document.removeEventListener('keydown', this.handleKeyDown)
	}

	showMenu = (e) => {
		let go = (url) => () => route(url)
		basicContext.show([
			{title: 'Cinema', fn: go('/')},
			{title: 'Effects', fn: go('/effects')},
			{title: 'Script Editor', fn: go('/scripts')},
			{},
			{title: 'Settings', fn: go('/settings')},
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

	handleKeyDown = (e) => {
		if(e.code == "Escape") {
			this.toggleHeader()
		} else if(e.altKey) {
			switch(e.code) {
				case "Backquote": this.toggleOff();    break;
				case "Escape":    this.toggleHeader(); break;
				// 
				case "Digit1":    route('/about');     break;
				case "Digit2":    route('/');          break;
				case "Digit3":    route('/effects');   break;
				case "Digit4":    route('/scripts');   break;
			}
		}
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
			connected: false,
			// serverWelcome: null,
			// stream: null,
		})

		if(!e.wasClean && !this.state.off) {
			console.error('Connection broke', '| Reconnecting', '|', e)
			setTimeout(() => this.openConnection(), this.reconnectDelay)
		}
	}

	/* Server communication */

	reconnectDelay = 250 // ms

	openConnection() {
		if(!this.connectionPromise) {
			this.connection = new Connection(WS_URL)
			this.connection.clientInfo = clientInfo
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

	pageTitle = () => {
		const firstSegment = (this.state.currentUrl || '').split('/')[1] || ''
		return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)
	}

	render({ }, { currentUrl, title, serverWelcome, connected, off, stream, amps, hideHeader }) {
		return (
			<div id="app">
				<Header pageTitle={this.pageTitle()} disconnected={serverWelcome && !connected} hide={hideHeader} onTitleClick={this.showMenu} onPowerToggle={this.toggleOff}></Header>

				{ /* the background LED strip */ }
				{ stream && <LEDStrip stream={stream} paused={off} /> }

				<div class="back" data-flip={currentUrl == '/settings'}>
					<Settings visible={currentUrl == '/settings'} />
				</div>

				<main id="main" data-flip={currentUrl == '/settings'} class="front">
					{ serverWelcome
						? <Router onChange={this.handleRoute}>
								<About path="/about/:page?" serverWelcome={serverWelcome} />
								<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
								<Effects path="/effects/:selection?" availableEffects={serverWelcome && serverWelcome.availableEffects} connection={this.connection} stream={stream} />
								<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
								<Repl path="/repl" />
								<Modes path="/spongebob" />
							</Router>
						: <Modal>Connecting...</Modal> }
				</main>
			</div>
		);
	}
}