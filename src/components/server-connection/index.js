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

var _buffer = []

// todo: refactor out of this file
function unpack(data) {
	data = new Uint8Array(data)

	let length = data.length

	for(let i=0; i<length; i=i+3) {
		if(!_buffer[i/3])
			_buffer[i/3] = []

		_buffer[i/3][0] = data[i]
		_buffer[i/3][1] = data[i+1]
		_buffer[i/3][2] = data[i+2]
	}

	if(_buffer.length > length/3)
		_buffer.length = length/3 // truncate extra pixels

	return _buffer
}