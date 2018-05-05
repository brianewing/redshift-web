export default class Connection {
	/* Sends and receives streams of pixels, effects and commands over a websocket */
	/* Messages are encoded using OpenPixelControl format */

	/* With the following system exclusive commands: */
	CmdOpenStream = 0
	CmdCloseStream = 1
	CmdSetStreamFps = 2
	CmdSetEffectsJson = 3
	CmdSetEffectsStreamFps = 4

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
			this.connectPromise.catch((e) => {
				/* reconnect whenever connection fails */
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
		const stream = new Stream(this)
		stream.channel = this._streams.length
		stream.description = desc

		this._streams.push(stream)

		this.connect().then(() => {
			this.sendSysEx(stream.channel, this.CmdOpenStream, stream.description)
			cb(stream)
		})
	}

	setStreamFps = (channel, fps) => {
		this.sendSysEx(channel, this.CmdSetStreamFps, [fps])
	}

	setEffectsStreamFps = (channel, fps) => {
		this.sendSysEx(channel, this.CmdSetEffectsStreamFps, [fps])
	}

	setEffectsJson = (channel, json) => {
		this.sendSysEx(channel, this.CmdSetEffectsJson, json)
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

class Stream {
	channel = 0
	description = '' // stored so stream can be reopened after connection loss

	constructor(connection) {
		this.connection = connection
		this.pixelBuffer = []
	}

	setFps(fps) { this.connection.setStreamFps(this.channel, fps) }
	setEffectsFps(fps) { this.connection.setEffectsStreamFps(this.channel, fps) }

	onEffects() {}

	handle(msg) {
		if(msg.command == 0) {
			this.unpackPixels(msg.data)
		} else if(msg.command == 255) { // system exclusive command
			if(msg.data[0] == this.connection.CmdSetEffectsJson) {
				const jsonBytes = new Uint8Array(msg.data.buffer, msg.data.byteOffset + 3)
				const jsonString = new TextDecoder("utf-8").decode(jsonBytes)
				this.onEffects && this.onEffects(JSON.parse(jsonString))
			} else {
				console.log('unrecognised sysex message', msg.data[0], msg)
			}
		}
	}

	onEffects() {}

	unpackPixels(data) {
		const { pixelBuffer } = this
		const length = data.length

		// pixels are sent like [r,g,b,r,g,b,r,g,b]
		// we want [[r,g,b],[r,g,b],[r,g,b]]
		for(let i=0; i<length; i=i+3) {
			if(pixelBuffer[i/3] == null)
				pixelBuffer[i/3] = []

			const led = pixelBuffer[i/3]
			led[0] = data[i]
			led[1] = data[i+1]
			led[2] = data[i+2]
		}

		// truncate extra pixels
		if(pixelBuffer.length > length/3)
			pixelBuffer.length = length/3
	}
}

const OpcVendorId = 65535

const reusedOpcMessage = {}

function parseOpcMessage(buffer) {
	let view = new DataView(buffer)
	reusedOpcMessage.channel = view.getUint8(0)
	reusedOpcMessage.command = view.getUint8(1)
	reusedOpcMessage.length = view.getUint16(2)
	reusedOpcMessage.data = new Uint8Array(buffer, 4)
	return reusedOpcMessage
}

// Creates a binary OPC message, returned as an ArrayBuffer
// Data parameter can be an Array, ArrayBuffer or DataView
// (spec @ openpixelcontrol.org)
function buildOpcMessage(channel, command, data) {
	let dataLength = (data.length || data.byteLength) // can be array, buffer or dataview
	let msg = new ArrayBuffer(4 + (data.length || data.byteLength))
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
