import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

import basicContext from 'basiccontext'

import Header from './header'
import ServerConnection from './server-connection'
import Remote from './routes/remote'
import Effects from './routes/effects'
import Scripts from './routes/scripts/index'

import Modal from './modal'

const HOST = location.hostname
const WS_URL = `ws://${HOST}:9191`
const SCRIPTS_URL = `http://${HOST}:9292`

const BUFFER_FPS = 60
const EFFECTS_FPS = 20

let ws2812_ComponentPower = (c) => (c / 255) * 0.02 // 20mA per color channel on full brightness

export default class App extends Component {
	handleRoute = e => { this.setState({currentUrl: e.url}) }

	componentWillMount() {
		window.addEventListener('blur', this.turnOff)
		window.addEventListener('focus', this.turnOn)
		window.app = this
	}

	componentWillUnmount() {
		window.removeEventListener('blur', this.turnOff)
		window.removeEventListener('focus', this.turnOn)
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

	onVisibilityChange = (e) => {
		this.setState({hide: document.hidden})
	}

	onConnectionChange = (connected) => {
		this.setState({ connected })
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

	sendEffects = (effects) => {
		const json = JSON.stringify(effects)
		this.effectsSocket && this.effectsSocket.sendMessage(json)
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

	render({ }, { currentUrl, connected, buffer, effects, amps, off, hideHeader }) {
		let headerExtra
		if(false && document.body.clientWidth > 480) headerExtra = `${this.mps} mps // ${amps} amps`

		return (
			<div id="app">
				{!off && <ServerConnection refBuffer={this.setBuffer} fps={BUFFER_FPS} url={WS_URL + '/s/strip'} onChange={this.onConnectionChange} />}
				{!off && <ServerConnection ref={this.setBufferSocket} url={WS_URL + '/strip'} />}
				{!off && currentUrl == '/effects' && <ServerConnection onMessage={this.setEffects} fps={EFFECTS_FPS} url={WS_URL + '/s/effects'} />}
				{!off && currentUrl == '/effects' && <ServerConnection ref={this.setEffectsSocket} url={WS_URL + '/effects'} />}

				<Header hide={hideHeader} buffer={buffer} onTitleClick={this.showMenu} toggleOff={this.toggleOff} off={off}>
					<div style="padding-top: 20px; display: inline-block">
						{headerExtra}
					</div>
				</Header>

				<main id="main">
					{ !connected && !off ? <Modal>Connecting...</Modal> : null }

					<Router onChange={this.handleRoute}>
						<div path="/" onClick={this.toggleHeader} style="width:100%;height:100%">{/* Cinema Mode */}</div>
						<Effects path="/effects" effects={effects} onSend={this.sendEffects} />
						<Scripts path="/scripts" serverUrl={SCRIPTS_URL} />
					</Router>
				</main>
			</div>
		);
	}
}
