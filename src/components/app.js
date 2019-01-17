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

const BUFFER_FPS = (HOST=='localhost' ? 60 : 30)

const clientInfo = {
	AppType: 0, // redshift app
	AppVersionMajor: 1,
	AppVersionMinor: 5,
	DeviceName: "",
}

export default class App extends Component {
	componentWillMount() {
		window.app = this
		this.openConnection()

		document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
	}

	componentWillUnmount() {
		this.closeConnection()
		document.removeEventListener('keydown', this.handleKeyDown)
		document.removeEventListener('visibilitychange', this.handleVisibilityChange)
	}

	showMenu = (e) => {
		let go = (url) => () => route(url)
		basicContext.show([
			{title: 'Cinema', fn: go('/')},
			{title: 'Effects', fn: go('/effects')},
			{title: 'Script Editor', fn: go('/scripts')},
			{title: 'Help', fn: go('/about')},
			{},
			{title: 'Settings', fn: go('/settings')},
			{title: (this.state.off ? 'Connect' : 'Disconnect'), fn: this.toggleOff},
			{},
			{title: 'Refresh', fn: () => window.location = window.location},
			{title: 'Fullscreen', fn: document.fullscreenEnabled && this.toggleFullscreen}
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

	toggleFullscreen = () => {
		if(document.fullscreenElement)
			document.exitFullscreen()
		else
			document.body.requestFullscreen()
	}

	/* Events */

	handleRoute = (e) => {
		this.setState({ currentUrl: e.url })
	}

	handleKeyDown = (e) => {
		if(e.code == "Escape") {
			this.toggleHeader()
		} else if(e.code == "IntlBackslash") {
			if(this.state.currentUrl == '/repl')
				window.history.go(-1)
			else
				route('/repl')
			e.preventDefault()
		} else if(e.altKey) {
			let match = false
			switch(e.code) {
				case "Backquote": route('/settings');  match = true; break
				case "Escape":    this.toggleHeader(); match = true; break
				// 
				case "Digit1":    route('/');          match = true; break
				case "Digit2":    route('/effects');   match = true; break
				case "Digit3":    route('/scripts');   match = true; break
				case "Digit4":    route('/repl');      match = true; break
				case "Digit5":    route('/about');     match = true; break
				case "Digit6":    this.toggleOff();    match = true; break
			}
			if(match) e.preventDefault()
		}
	}

	handleVisibilityChange = (e) => {
		console.log('visibility change', document.hidden)
		const { stream } = this.state
		if(document.hidden) {
			stream && stream.setFps(0)
		} else {
			stream && stream.setFps(Config.bufferFps)
		}
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
			stream.setFps(Config.bufferFps)
		})
	}

	/* Rendering */

	pageTitle = () => {
		const firstSegment = (this.state.currentUrl || '').split('/')[1] || ''
		if(firstSegment == 'repl')
			return 'Console';
		return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)
	}

	render({ }, { currentUrl, title, serverWelcome, connected, off, stream, amps, hideHeader }) {
		return (
			<div id="app">
				<Header pageTitle={this.pageTitle()} disconnected={serverWelcome && !connected} hide={hideHeader} onTitleClick={this.showMenu} onPowerToggle={this.toggleOff}></Header>

				{ /* the background LED strip */ }
				{ stream && <LEDStrip stream={stream} paused={off} /> }


				<main id="main" class={(hideHeader ? 'headerHidden' : '')}>
					{ serverWelcome
						? <Router onChange={this.handleRoute}>
								<Settings path="/settings" />
								<About path="/about/:page?" serverWelcome={serverWelcome} />
								<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
								<Effects path="/effects/:selection?" availableEffects={serverWelcome && serverWelcome.availableEffects} connection={this.connection} stream={stream} />
								<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
								<Repl path="/repl" stream={stream} />
								<Modes path="/spongebob" />
							</Router>
						: <Modal>Connecting...</Modal> }
				</main>
			</div>
		);
	}
}