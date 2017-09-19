import { h, Component } from 'preact'
import { Router } from 'preact-router'

import Header from './header'
import ServerConnection from './server-connection'
import Remote from '../routes/remote'
import Modes from '../routes/modes'

import LEDStrip from './led-strip'

const WS_URL = 'ws://192.168.1.3:9191/strip'

export default class App extends Component {
	handleRoute = e => { this.currentUrl = e.url }

	messageCount = 0
	mps = 0
	toggleCount = 0

	events = {
		orientationchange: 'orientationChange',
		visibilitychange: 'visibilityChange',
		keypress: 'toggleOff'
	}

	componentWillMount() {
		setInterval(() => {
			this.mps = this.messageCount
			this.messageCount = 0
		}, 1000)

		for(let event in this.events)
			window.addEventListener(event, this[this.events[event]])
	}

	componentWillUnmount() {
		for(let event in this.events)
			window.removeEventListener(event, this[this.events[event]])
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

	handleBuffer = buffer => {
		this.messageCount += 1
		this.setState({stripBuffer: buffer})
	}

	toggleOff = (e) => {
		this.mps = 0
		setTimeout(() => this.setState({off: !this.state.off}), 0)
	}

	render({ }, { stripBuffer, off, hide }) {
		if(hide) return;
		let headerExtra = (document.body.clientWidth > 320) && `${this.mps} mps`

		return (
			<div id="app">
				<Header stripBuffer={stripBuffer} toggleOff={this.toggleOff}>
					<div style="padding-top: 20px; display: inline-block">
						{headerExtra}
					</div>
				</Header>
				{!off && <ServerConnection onBuffer={this.handleBuffer} url={WS_URL} />}
				<Router onChange={this.handleRoute}>
					<Remote path="/" stripBuffer={stripBuffer} />
					<Modes path="/modes" />
				</Router>
			</div>
		);
	}
}
