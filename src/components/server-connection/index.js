import { Component } from 'preact'

import Timings from '../../lib/timings'

export default class ServerConnection extends Component {
	reconnectDelay = 50 // ms

	componentWillMount() {
		this.stripBuffer = []

		let { refBuffer } = this.props
		refBuffer && refBuffer(this.stripBuffer)

		// this.timings = new Timings('ServerConnection.handleMessage').startLogging()

		this.connect()
	}

	componentWillUnmount() {
		this.webSocket && this.webSocket.close()
		// this.timings.stopLogging()
		this.connect = () => {}
	}

	connect() {
		let { url } = this.props;
		this.webSocket = new WebSocket(url)
		this.webSocket.onmessage = this.handleMessage
		this.webSocket.binaryType = 'arraybuffer'
		this.webSocket.onclose = () => {
			setTimeout(() => this.connect(), this.reconnectDelay)
		}
	}

	handleMessage = (e) => {
		let { data } = e
		let { onBuffer, onMessage } = this.props

		// this.timings.start()

		if(data instanceof ArrayBuffer) {
			unpack(data, this.stripBuffer)
			onBuffer && onBuffer(this.stripBuffer)
		} else {
			onMessage && onMessage(JSON.parse(data))
		}

		// this.timings.finish()
	}
}

// Unpacks `data` into `buffer`
// [r0, g0, b0, r1, g1, b1] => [[r, g, b], [r, g, b]]
// todo: refactor this into another file
function unpack(data, buffer) {
	data = new Uint8Array(data)

	let length = data.length

	for(let i=0; i<length; i=i+3) {
		if(!buffer[i/3])
			buffer[i/3] = []

		buffer[i/3][0] = data[i]
		buffer[i/3][1] = data[i+1]
		buffer[i/3][2] = data[i+2]
	}

	if(buffer.length > length/3)
		buffer.length = length/3 // truncate extra pixels

	return buffer
}