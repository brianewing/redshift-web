import { h, cloneElement, Component } from 'preact'
import { Router, route } from 'preact-router'

import SimpleViewSlider from 'react-view-slider/lib/simple'

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

const BUFFER_FPS = 40

const clientInfo = {
	AppType: 0, // redshift app
	AppVersionMajor: 1,
	AppVersionMinor: 5,
	DeviceName: "Brian's Laptop",
}

export default class App extends Component {
	componentWillMount() {
		this.openConnection()
		window.app = this

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

	handleKeyDown = (e) => {
		if(e.altKey) {
			switch(e.key) {
				case "§": this.toggleOff();         break;
				case "1": route('/about');          break;
				case "2": route('/');               break;
				case "3": route('/effects');        break;
				case "4": route('/scripts');        break;
				case "Escape": this.toggleHeader(); break;
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
			// serverWelcome: null,
			connected: false,
			// stream: null,
		})

		if(!e.wasClean && !this.state.off) {
			console.error('Connection break', e)
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
        .then(() => alert('connected'))
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
		// console.log('viewprops', this.viewProps())
		return (
			<div id="app">
				<Header pageTitle={this.pageTitle()} disconnected={serverWelcome && !connected} hide={hideHeader} onTitleClick={this.showMenu} onPowerToggle={this.toggleOff}></Header>

				{ stream && <LEDStrip stream={stream} paused={off} /> }

				<main id="main">
					{ serverWelcome
						? <SlideRouter onChange={this.handleRoute} viewProps={this.viewProps()}>
								<About path="/about/:page?" serverWelcome={serverWelcome} />
								<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
								<Effects path="/effects/:selection?" availableEffects={serverWelcome && serverWelcome.availableEffects} connection={this.connection} stream={stream} />
								<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
							</SlideRouter>
						: <Modal>Connecting...</Modal> }
				</main>
			</div>
		);
	}

	viewProps = () => {
		const segments = (this.state.currentUrl || '').split('/').slice(1)
		switch(segments[0]) {
			case "about": return {page: segments[1]};
			case "effects":
				if(segments[1] == null) {
					return {selection: this._lastSelection}
				} else {
					this._lastSelection = segments[1];
					return {selection: segments[1]};
				}
		}
	}
}

const SlideRouter = ({children, ...props}) => {
	return <Router {...props}>
		{ children.map( (child, i) =>
				<SimpleViewSlider {...child.attributes} animateHeight={false} fillParent={true} transitionDuration={300} measureHeight={() => '100%'} keepViewsMounted>
					<div key={i} style="height:100%">
						{cloneElement(child, props.viewProps)}
					</div>
				</SimpleViewSlider>
		) }
	</Router>
}
