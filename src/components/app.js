import { h, Component } from 'preact'
import { Router } from 'preact-router'

import Header from './header'
import ServerConnection from './server-connection'
import Remote from '../routes/remote'
import Modes from '../routes/modes'

import LEDStrip from './led-strip'

const WS_URL = 'ws://192.168.1.3:9191/strip'

// 20mA per color channel on full brightness
let ws2812_ComponentPower = (c) => (c / 255) * 0.02

export default class App extends Component {
	handleRoute = e => { this.currentUrl = e.url }

	events = {
		orientationchange: 'orientationChange',
		// visibilitychange: 'visibilityChange',
		keypress: 'toggleOff'
	}

	componentWillMount() {
		for(let event in this.events) {
			window.addEventListener(event, this[this.events[event]])
		}
	}

	componentWillUnmount() {
		for(let event in this.events) {
			window.removeEventListener(event, this[this.events[event]])
		}
	}

	orientationChange = (e) => {
		this.setState({hide: true})
		setTimeout(() => this.setState({hide: false}), 0)
	}

	visibilityChange = (e) => {
		this.setState({hide: document.hidden})
	}

	// componentDidUpdate() {
	// 	if(!this.state.stripBuffer) return
	// 	let darken = (x) => Math.max(0, x - 220)
	// 	let cssColor = `rgb(${this.state.stripBuffer[1].map(darken).join(',')})`
	// 	document.body.style.backgroundColor = cssColor
	// }

	setBuffer = (buffer) => {
		this.setState({buffer: buffer})
	}

	handleMessage = (msg) => {
		this.latestMsg = msg
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

	render({ }, { buffer, amps, off, hide }) {
		if(hide) return;
		let headerExtra = false && (document.body.clientWidth > 450) && `${this.mps} mps // ${amps} amps`

		return (
			<div id="app">
				{!off && <ServerConnection refBuffer={this.setBuffer} onMessage={this.handleMessage} url={WS_URL} />}

				<Header buffer={buffer} toggleOff={this.toggleOff} off={off}>
					<div style="padding-top: 20px; display: inline-block">
						{headerExtra}
					</div>
				</Header>

				<Router onChange={this.handleRoute}>
					<Remote path="/" buffer={buffer} off={off} />
					<Modes path="/modes" />
				</Router>
			</div>
		);
	}
}
