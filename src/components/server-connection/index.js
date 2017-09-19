import { Component } from 'preact'

export default class WebSocket extends Component {
	reconnectDelay = 50 // ms

	componentWillMount() {
		this.connect()
		// this.timings = []
		// setInterval(this.logTimings, 1000)
	}

	componentWillUnmount() {
		this.webSocket && this.webSocket.close()
		this.connect = () => {}
	}

	connect() {
		let { url } = this.props;
		this.webSocket = new window.WebSocket(url)
		this.webSocket.onmessage = this.handleMessage
		this.webSocket.binaryType = 'arraybuffer'
		this.webSocket.onclose = () => {
			setTimeout(() => this.connect(), this.reconnectDelay)
		}
	}

	handleMessage = (e) => {
		let { data } = e
		let { onBuffer, onMessage } = this.props

		// let start = performance.now()

		if(data instanceof ArrayBuffer) {
			onBuffer && onBuffer(unpack(data))
		} else {
			data = JSON.parse(data)
			if(data.buffer) {
				onBuffer && onBuffer(data.buffer)
			} else {
				onMessage && onMessage(data)
			}
		}

		// this.timings.push(performance.now() - start)
	}

	logTimings = () => {
		let sum = 0
		for(let i=0; i<this.timings.length; i++)
			sum += this.timings[i]

		console.log(sum / this.timings.length)
		this.timings = []
	}
}

// todo: refactor out of this file
function unpack(data) {
	data = new Uint8Array(data)

	let buffer = []
	let length = data.length

	for(let i=0; i<length; i=i+3) {
		buffer[i/3] = [data[i], data[i+1], data[i+2]]
	}

	return buffer
}