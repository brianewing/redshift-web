export default class Connection {
	/* Sends and receives streams of pixels, effects and commands over a websocket */
	/* Messages are encoded using OpenPixelControl format */

	/* With the following system exclusive commands: */
	CmdOpenStream = 0
	CmdCloseStream = 1
	CmdSetStreamFps = 2
	CmdSetEffectsJson = 3

	/* This array tracks streams opened with CmdOpenStream, indexed by channel */
	_streams = []

	reconnectDelay = 500 // in milliseconds

	url = '' // of a Redshift websocket

	constructor(url) {
		this.url = url
	}

	connect() {
		if(!this.connectPromise) {
			this.connectPromise = new Promise(this._open)
			/* reconnect whenever connection fails */
			this.connectPromise.catch((e) => {
				console.error('connect promise ::', 'catch ::', e)
				setTimeout(() => this.connect(), this.reconnectDelay)
			})
		}
		return this.connectPromise
	}

	_open = (resolve, reject) => {
		this.webSocket = new WebSocket(this.url)
		this.webSocket.binaryType = 'arraybuffer'

		this.webSocket.onopen = resolve
		this.webSocket.onclose = reject
		this.webSocket.onmessage = this.handleMessage
	}

	close() {
		/* todo: catch error onclose to prevent reconnect */
		this.webSocket && this.webSocket.close()
	}

	openStream(desc, cb) {
		let buffer = []

		let stream = Object.assign(new pixelStream, {description: desc, buffer: buffer})
		this._streams.push(stream)

		this.connect().then(() => {
			this.sendSysEx(this._streams.length-1, this.CmdOpenStream, desc)
			cb(this._streams.length-1, buffer)
		})
	}

	setStreamFps = (channel, fps) => {
		this.sendSysEx(channel, this.CmdSetStreamFps, [fps])
	}

	sendSysEx(channel, command, data) {
		if(typeof data == "string") // must be encoded as utf-8
			data = new TextEncoder("utf-8").encode(data)

		const msg = buildSysExOpcMessage(channel, command, data)
		console.log("send sys ex", new Uint8Array(msg))

		this.sendBytes(msg)
	}

	sendBytes = (bytes) => {
		this.webSocket.send(bytes)
	}

	handleMessage = (e) => {
		const { data } = e

		if(data instanceof ArrayBuffer) {
			// console.log('handle binary message', new Uint8Array(data))
			const msg = parseOpcMessage(data)
			const stream = this._streams[msg.channel]

			if(stream)
				stream.handle(msg)
			else
				console.error("received opc message for unknown channel", msg)
		}
	}
}

class stream {
	description = '' // stored so stream can be reopened after connection loss
	handle(msg) {}   // implemented by stream objects, see below
}

class pixelStream extends stream {
	buffer = []

	handle(msg) {
		this.unpack(msg.data)
	}

	unpack(data) {
		const { buffer } = this
		const dataView = data
		const length = dataView.length

		// pixels are sent like [r,g,b,r,g,b,r,g,b]
		// we want [[r,g,b],[r,g,b],[r,g,b]]
		for(let i=0; i<length; i=i+3) {
			if(buffer[i/3] == null)
				buffer[i/3] = []

			const led = buffer[i/3]
			led[0] = dataView[i]
			led[1] = dataView[i+1]
			led[2] = dataView[i+2]
		}

		// truncate extra pixels
		if(buffer.length > length/3)
			buffer.length = length/3
	}
}

const OpcVendorId = 65535

const sharedMsg = Object.create(null)

function parseOpcMessage(buffer) {
	let view = new DataView(buffer)
	sharedMsg.channel = view.getUint8(0)
	sharedMsg.command = view.getUint8(1)
	sharedMsg.length = view.getUint16(2)
	sharedMsg.data = new Uint8Array(buffer, 4)
	return sharedMsg
}

// Creates a binary OPC message, returned as an ArrayBuffer
// (spec @ openpixelcontrol.org)
function buildOpcMessage(channel, command, data) {
	let msg = new ArrayBuffer(4+(data.length || data.byteLength))
	let view = new DataView(msg)

	view.setUint8(0, channel)
	view.setUint8(1, command)
	view.setUint16(2, (data.length || data.byteLength))
	new Uint8Array(msg, 4).set(data)

	return msg
}

function buildSysExOpcMessage(channel, sysExCommand, sysExDataBytes) {
	// redshift sysex data is encoded as an opc message without the channel prefix
	const sysexData = new Uint8Array(buildOpcMessage(0, sysExCommand, sysExDataBytes), 1)

	// wrapped in a normal opc message with command 255 ('system exclusive')
	const msg = buildOpcMessage(channel, 255, sysexData) 

	// where the length bytes instead represent a system or vendor id
	new DataView(msg).setUint16(2, OpcVendorId)

	return msg
}
