import { parseOpcMessage, buildSysExOpcMessage }  from './lib/redshift-opc';

import Stream from './stream';

/* Sends and receives streams of pixels, effects and commands over a websocket */
/* Messages are encoded in OpenPixelControl format */

export default class Connection {
	/* System exclusive commands: */
	CmdOpenStream = 0
	CmdCloseStream = 1
	CmdSetStreamFps = 2
	CmdSetEffectsJson = 3
	CmdSetEffectsStreamFps = 4

	/* This array tracks streams opened with CmdOpenStream, indexed by channel */
	_streams = []

	url = ''

	constructor(url) {
		this.url = url
	}

	onClose(e) {} // override this to receive close events [todo: refactor]

	connect() {
		if(!this.connectPromise) {
			this.connectPromise = new Promise(this._open)
		}
		return this.connectPromise
	}

	_open = (resolve, reject) => {
		this.webSocket = new WebSocket(this.url)
		this.webSocket.binaryType = 'arraybuffer'

		this.webSocket.onopen = resolve
		this.webSocket.onmessage = this.receiveMessage
		this.webSocket.onclose = (e) => {
			this.onClose(e)
			reject()
		}
	}

	close() {
		this.webSocket && this.webSocket.close()
	}

	openStream(desc) {
		const stream = new Stream(this)
		stream.channel = this._streams.length

		this._streams.push(stream)

		return this.connect().then(() => {
			this.sendSysEx(stream.channel, this.CmdOpenStream, desc)
			return stream
		})
	}

	/* Redshift system commands */

	setStreamFps = (channel, fps) => this.sendSysEx(channel, this.CmdSetStreamFps, [fps])
	setEffectsStreamFps = (channel, fps) => this.sendSysEx(channel, this.CmdSetEffectsStreamFps, [fps])

	setEffects = (channel, effects) => this.setEffectsJson(channel, JSON.stringify(effects))
	setEffectsJson = (channel, json) => this.sendSysEx(channel, this.CmdSetEffectsJson, json)

	sendSysEx(channel, command, data) {
		if(typeof data == "string") // must be encoded as utf-8 bytes
			data = new TextEncoder("utf-8").encode(data)

		const msg = buildSysExOpcMessage(channel, command, data)
		console.debug("send sys ex", new Uint8Array(msg))

		this.sendBytes(msg)
	}

	/* Send & receive */

	sendBytes = (bytes) => {
		this.webSocket.send(bytes)
	}

	receiveMessage = (e) => {
		const { data } = e
		if(data instanceof ArrayBuffer) {
			const msg = parseOpcMessage(data)
			const stream = this._streams[msg.channel]
			if(stream)
				stream.handle(msg)
			else
				console.error("received opc message for unknown channel", msg)
		} else {
			console.error("received text message, expecting opc binary")
		}
	}
}
