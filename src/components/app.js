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

	componentWillMount() {
		setInterval(() => {
			this.mps = this.messageCount
			this.messageCount = 0
		}, 1000)
	}

	// componentDidUpdate() {
	// 	if(!this.state.stripBuffer) return
	// 	let darken = (x) => Math.max(0, x - 230)
	// 	let cssColor = `rgb(${this.state.stripBuffer[1].map(darken).join(',')})`
	// 	document.body.style.backgroundColor = cssColor
	// }

	handleMessage = msg => {
		this.messageCount += 1
		if(msg.buffer)
			this.setState({stripBuffer: msg.buffer})
	}

	toggleOff = () => {
		this.mps = 0
		this.setState({off: !this.state.off})
	}

	render({ }, { stripBuffer, off }) {
		return (
			<div id="app">
				<Header stripBuffer={stripBuffer} toggleOff={this.toggleOff}>
					<div style="padding-top: 20px; display: inline-block">
						{this.mps} mps
						{false && <LEDStrip buffer={stripBuffer && stripBuffer.slice(0,30)} />}
					</div>
				</Header>
				{!off && <ServerConnection onMessage={this.handleMessage} url={WS_URL} />}
				<Router onChange={this.handleRoute}>
					<Remote path="/" stripBuffer={stripBuffer} />
					<Modes path="/modes" />
				</Router>
			</div>
		);
	}
}
