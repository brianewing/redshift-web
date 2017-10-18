import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

import basicContext from 'basiccontext'

import Header from './header'
import ServerConnection from './server-connection'
import Remote from './routes/remote'
import Effects from './routes/effects'
import Scripts from './routes/scripts/index'

const WS_URL = 'ws://192.168.1.3:9191'
const SCRIPTS_URL = 'http://192.168.1.3:9292'
const BUFFER_FPS = 60
const EFFECTS_FPS = 20

// 20mA per color channel on full brightness
let ws2812_ComponentPower = (c) => (c / 255) * 0.02

export default class App extends Component {
	handleRoute = e => { this.setState({currentUrl: e.url}) }

	componentWillMount() {
		window.app = this
		window.addEventListener('orientationchange', this.onOrientationChange)
		// window.addEventListener('keypress', this.onKeyPress)
	}

	componentWillUnmount() {
		window.removeEventListener('orientationchange', this.onOrientationChange)
		window.removeEventListener('keypress', this.onKeyPress)
	}

	showMenu = (e) => {
		let noop = () => {}
		let go = (url) => () => route(url)
		basicContext.show([
			{title: 'Cinema', fn: go('/')},
			{title: 'Effects', fn: go('/effects')},
			{title: 'Script Editor', fn: go('/scripts')},
			{},
			{title: 'Change Server', fn: noop},
			{title: (this.state.off ? 'Connect' : 'Disconnect'), fn: this.toggleOff}
		], e)
	}

	/* Events */

	onOrientationChange = (e) => {
		this.setState({hide: true})
		setTimeout(() => this.setState({hide: false}), 0)
	}

	onVisibilityChange = (e) => {
		this.setState({hide: document.hidden})
	}

	onKeyPress = (e) => {
		console.log(e)
	}

	/* Server communication */

	setBufferSocket = (ws) => {
		this.bufferSocket = ws
	}

	setEffectsSocket = (ws) => {
		this.effectsSocket = ws
	}

	setBuffer = (buffer) => {
		this.setState({buffer: buffer})
	}

	setEffects = (effects) => {
		this.setState({effects: effects})
	}

	sendBuffer = (buffer) => {
		this.bufferSocket && this.bufferSocket.sendBytes(buffer)
	}

	sendCustomEffectsJson = (json) => {
		this.effectsSocket && this.effectsSocket.sendMessage(json)
	}

	calculateAmps = (buffer) => {
		let amps = 0
		for(let i=0; i<buffer.length; i++) {
			let [ r, g, b ] = buffer[i]
			amps += (ws2812_ComponentPower(r) + ws2812_ComponentPower(g) + ws2812_ComponentPower(b))
		}
		return amps.toFixed(2)
	}

	toggleOff = (e) => {
		setTimeout(() => this.setState({off: !this.state.off}), 0)
	}

	render({ }, { currentUrl, buffer, effects, amps, off, hide }) {
		let headerExtra
		if(hide) return;
		if(false && document.body.clientWidth > 480) headerExtra = `${this.mps} mps // ${amps} amps`

		return (
			<div id="app">
				{!off && <ServerConnection ref={(ws) => window.ws = ws} refBuffer={this.setBuffer} fps={BUFFER_FPS} url={WS_URL + '/s/strip'} />}
				{!off && <ServerConnection ref={this.setBufferSocket} url={WS_URL + '/strip'} />}
				{!off && currentUrl == '/effects' && <ServerConnection onMessage={this.setEffects} fps={EFFECTS_FPS} url={WS_URL + '/s/effects'} />}
				{!off && currentUrl == '/effects' && <ServerConnection ref={this.setEffectsSocket} url={WS_URL + '/effects'} />}

				<Header buffer={buffer} cinemaMode={currentUrl == '/'} onTitleClick={this.showMenu} toggleOff={this.toggleOff} off={off}>
					<div style="padding-top: 20px; display: inline-block">
						{headerExtra}
					</div>
				</Header>

				<div id="main">
					<Router onChange={this.handleRoute}>
						<Remote path="/" buffer={buffer} off={off} />
						<Effects path="/effects" effects={effects} onCustomJson={this.sendCustomEffectsJson} />
						<Scripts path="/scripts" serverUrl={SCRIPTS_URL} onWrite={this.sendScript} />
					</Router>
				</div>
			</div>
		);
	}
}
