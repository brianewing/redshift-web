import { Component } from 'preact'

export default class WebSocket extends Component {
	reconnectDelay = 50 // ms

	componentWillMount() {
		this.connect();
	}

	componentWillUnmount() {
		this.webSocket && this.webSocket.close()
		this.connect = () => {}
	}

	connect() {
		let { url } = this.props;
		this.webSocket = new window.WebSocket(url)
		this.webSocket.onmessage = this.handleMessage
		this.webSocket.onclose = () => {
			setTimeout(() => this.connect(), this.reconnectDelay)
		}
	}

	handleMessage = (e) => {
		let { data } = e
		let { onMessage } = this.props

		onMessage && data && onMessage(JSON.parse(data))
	}
}
