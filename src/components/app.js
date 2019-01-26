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

const clientInfo = {
	AppType: 0, // redshift app
	AppVersionMajor: 1,
	AppVersionMinor: 5,
	DeviceName: "",
}

export default class App extends Component {
	state = {
		ping: 0,
	}

	componentWillMount() {
		window.app = this
		this.openConnection()

		document.body.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
		document.addEventListener('mouseenter', this.handleMouseEnter)
		document.addEventListener('mouseleave', this.handleMouseLeave)
	}

	componentWillUnmount() {
		this.closeConnection()
		document.removeEventListener('keydown', this.handleKeyDown)
		document.removeEventListener('visibilitychange', this.handleVisibilityChange)
		document.removeEventListener('mouseenter', this.handleMouseEnter)
		document.removeEventListener('mouseleave', this.handleMouseLeave)
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
			// {title: 'Test Ping', fn: () => this.pingTest(true)},
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

	pingTest = (begin=false) => {
		if(!this._pings) this._pings = []
		if(begin) this.setState({ ping: "Calculating" })
		this.connection.sendPing().then((ms) => {
			if(this.state.ping == null)
				return

			this.setState({ ping: ms })
			this._pings.push(ms)
			setTimeout(this.pingTest, 100)
		})
	}

	/* Events */

	handleRoute = (e) => {
		this.setState({ currentUrl: e.url })
	}

	handleVisibilityChange = (e) => {
		const { stream } = this.state
		if(document.hidden) {
			stream && stream.setFps(0)
		} else {
			stream && stream.setFps(Config.bufferFps)
		}
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

	handleMouseEnter = (e) => {
		if(Config.autoHideHeader)
			this.setState({ hideHeader: false })
	}

	handleMouseLeave = (e) => {
		if(Config.autoHideHeader)
			this.setState({ hideHeader: true })
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
		this.setState({ connected: false, off: true })
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
		else
			return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)
	}

	render({ }, { serverWelcome, connected, off, stream, hideHeader, ping }) {
		return (
			<div id="app">
				<Header pageTitle={this.pageTitle()} disconnected={serverWelcome && !connected} hide={hideHeader} onTitleClick={this.showMenu} onPowerToggle={this.toggleOff}></Header>

				{ /* the background LED strip */ }
				{ stream && <LEDStrip stream={stream} paused={off} /> }

				{ ping ? <Modal onClose={() => this.setState({ ping: null })}>
					<h2>Ping { ping }ms</h2>
					Average { (this._pings.reduce((a,b) => a+b, 0) / this._pings.length).toFixed(2) }
				</Modal> : null }

				<main id="main" class={(hideHeader ? 'headerHidden' : '')}>
					{ serverWelcome
						? <Router onChange={this.handleRoute}>
								<Settings path="/settings" />
								<About path="/about/:page?" serverWelcome={serverWelcome} />
								<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%;-webkit-app-region:drag">{/* Cinema Mode */}</div>
								<Effects path="/effects/:selection?" availableEffects={serverWelcome && serverWelcome.availableEffects} connection={this.connection} stream={stream} />
								<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
								<Repl path="/repl" stream={stream} />
								<Modes path="/spongebob" />
							</Router>
						: <Modal><input onInput={(e) => Config.host = e.currentTarget.value} value={Config.host} />Connecting...</Modal> }
				</main>
			</div>
		);
	}
}