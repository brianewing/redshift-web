import { parseOpcMessage, buildSysExOpcMessage }  from './lib/redshift-opc';
import addEventMethods from './lib/event-methods';

import Stream from './stream';

/* Sends and receives streams of pixels, effects and commands over a websocket */
/* Messages are encoded in OpenPixelControl format */

export default class Connection {
	/* System exclusive commands: */
	CmdWelcome = 0
	CmdOpenStream = 1
	CmdCloseStream = 2
	CmdSetStreamFps = 3
	CmdSetEffectsJson = 4
	CmdSetEffectsStreamFps = 5
	CmdSetEffectsYaml = 6
	CmdAppendEffectJson = 7
	CmdAppendEffectYaml = 8
	CmdOscSummary = 9

	/* This array tracks streams opened with CmdOpenStream, indexed by channel */
	_streams = []

	_oscSummaryListeners = []

	url = ''

	constructor(url) {
		this.url = url
		addEventMethods(this)
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
		this.webSocket.onmessage = this.receiveMessage
		this.webSocket.onopen = () => {
			this.sendWelcome()
			resolve()
		}
		this.webSocket.onclose = (e) => {
			this.onClose(e)
			reject()
		}
	}

	close() {
		this.webSocket && this.webSocket.close()
	}

	/* Redshift system commands */

	openStream(desc) {
		const stream = new Stream(this)
		stream.channel = this._streams.length

		this._streams.push(stream)

		return this.connect().then(() => {
			this.sendSysEx(stream.channel, this.CmdOpenStream, desc)
			return stream
		})
	}

	closeStream(channel) { this.sendSysEx(channel, this.CmdCloseStream) }

	// called when server responds to CmdCloseStream
	_onStreamClosed(channel) { this.streams.splice(channel, 1) }

	setStreamFps = (channel, fps) => this.sendSysEx(channel, this.CmdSetStreamFps, [fps])
	setEffectsStreamFps = (channel, fps) => this.sendSysEx(channel, this.CmdSetEffectsStreamFps, [fps])

	setEffects = (channel, effects) => this.setEffectsJson(channel, JSON.stringify(effects))
	setEffectsJson = (channel, json) => this.sendSysEx(channel, this.CmdSetEffectsJson, json)

	requestOscSummary = () => {
		this.sendSysEx(0, this.CmdOscSummary)

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(reject, 5000)

			this._oscSummaryListeners.push((summary) => {
				clearTimeout(timeout)
				resolve(summary)
			})
		})
	}

	sendWelcome() {
		this.sendSysEx(0, this.CmdWelcome, [])
	}

	sendSysEx(channel, command, data) {
		if(typeof data == "string") // must be encoded as utf-8 bytes
			data = new TextEncoder("utf-8").encode(data)

		const msg = buildSysExOpcMessage(channel, command, data)
		console.debug("send sys ex", new Uint8Array(msg))

		this.sendBytes(msg)
	}

	/* Send & receive */

	sendBytes(bytes) {
		this.webSocket.send(bytes)
	}

	receiveMessage = (e) => {
		const { data } = e
		if(data instanceof ArrayBuffer) {
			const msg = parseOpcMessage(data)
			const stream = this._streams[msg.channel]

			if(msg.sysExCommand == this.CmdWelcome) {
				this.receiveWelcome(msg)
			} else if(msg.sysExCommand == this.CmdCloseStream) { // stream successfully closed
				this._onStreamClosed(msg.channel)
			} else if(msg.sysExCommand == this.CmdOscSummary) {
				this.receiveOscSummary(msg)
			} else if(stream) {
				stream.handle(msg)
			} else {
				console.error("received opc message for unknown channel", msg)
			}
		} else {
			console.error("received text message, expecting opc binary")
		}
	}

	receiveWelcome = (msg) => {
		const welcomeJson = new TextDecoder("utf-8").decode(msg.sysExData)
		const serverInfo = JSON.parse(welcomeJson)

		serverInfo.started = new Date(serverInfo.started)

		this.onWelcome && this.onWelcome(serverInfo)
	}

	receiveOscSummary = (msg) => {
		const summaryJson = new TextDecoder("utf-8").decode(msg.sysExData)
		const summary = JSON.parse(summaryJson)

		for(let i=0; i<this._oscSummaryListeners.length; i++) {
			const fn = this._oscSummaryListeners[i]
			fn(summary)
		}

		this._oscSummaryListeners.length = 0 // truncate
	}
}
