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
	CmdAppendEffectsJson = 7
	CmdAppendEffectsYaml = 8

	CmdOscSummary = 9
	CmdClearOscSummary = 10

	CmdErrorOccurred = 11

	CmdRepl = 12

	CmdPing = 13
	CmdPong = 14

	CmdClose = 15

	CmdUpdateEffectsInPlace = 16

	/* an array of streams opened with CmdOpenStream, indexed by channel */
	_streams = []

	_pongListeners = {} // callbacks waiting on response to CmdPing, indexed by ping msg
	_oscSummaryListeners = [] // callbacks waiting on response to CmdOscSummary

	_pingNumber = 0

	clientInfo = {}

	url = ''

	constructor(url) {
		this.url = url
		addEventMethods(this) // on, off, emit
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
			this.sendWelcome(this.clientInfo)
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

	// tells the server that this is a redshift client
	// server will respond with information about itself
	sendWelcome(info) {
		this.sendSysEx(0, this.CmdWelcome, JSON.stringify(info))
	}

	sendPing(timeoutMs=5000) {
		const msg = (this._pingNumber++).toString()
		this.sendSysEx(0, this.CmdPing, msg)

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(reject, timeoutMs)
			const sendTime = new Date
			this._pongListeners[msg] = () => {
				clearTimeout(timeout)
				resolve(new Date() - sendTime)
			}
		})
	}

	async openStream(desc) {
		const stream = new Stream(this)
		stream.channel = this._streams.length

		this._streams.push(stream)

		return await this.connect().then(() => {
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
	setEffectsYaml = (channel, yaml) => this.sendSysEx(channel, this.CmdSetEffectsYaml, yaml)

	appendEffects = (channel, effects) => this.appendEffectsJson(channel, JSON.stringify(effects))
	appendEffectsJson = (channel, json) => this.sendSysEx(channel, this.CmdAppendEffectsJson, json)
	appendEffectsYaml = (channel, yaml) => this.sendSysEx(channel, this.CmdAppendEffectsYaml, yaml)

	updateEffectsInPlace = (channel, path, effects) => {
		const data = `${path}\0${JSON.stringify(effects)}`
		this.sendSysEx(channel, this.CmdUpdateEffectsInPlace, data)
	}

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

	clearOscSummary = () => {
		this.sendSysEx(0, this.CmdClearOscSummary)
	}

	sendReplCommand = (channel, cmd) => {
		this.sendSysEx(channel, this.CmdRepl, cmd)
	}

	/* Send & receive */

	sendSysEx(channel, command, data) {
		if(typeof data == "string") // must be encoded as utf-8 bytes
			data = new TextEncoder("utf-8").encode(data)

		const msg = buildSysExOpcMessage(channel, command, data)
		this.sendBytes(msg)
	}

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
			} else if(msg.sysExCommand == this.CmdPong) {
				this.receivePong(msg)
			} else if(msg.sysExCommand == this.CmdCloseStream) { // stream successfully closed
				this._onStreamClosed(msg.channel)
			} else if(msg.sysExCommand == this.CmdOscSummary) {
				this.receiveOscSummary(msg)
			} else if(msg.sysExCommand == this.CmdErrorOccurred) {
				this.receiveError(msg)
			} else if(stream) {
				stream.handle(msg)
			} else {
				console.error("received opc message for unknown channel", msg)
			}
		} else {
			console.error(this, "received text, expecting binary opc message:", data)
		}
	}

	receiveWelcome = (msg) => {
		const welcomeJson = new TextDecoder("utf-8").decode(msg.sysExData)
		const serverInfo = JSON.parse(welcomeJson)

		serverInfo.started = new Date(serverInfo.started)

		console.info("Welcome to Redshift", serverInfo.version, serverInfo)
		this.onWelcome && this.onWelcome(serverInfo)
	}

	receivePong = (msg) => {
		const pongMsg = new TextDecoder("utf-8").decode(msg.sysExData)
		if(this._pongListeners.hasOwnProperty(pongMsg)) {
			this._pongListeners[pongMsg]()
			delete this._pongListeners[pongMsg]
		}
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

	receiveError = (msg) => {
		const errorCmd = msg.sysExData[0] // which command caused the error
		const errorMsg = new TextDecoder("utf-8").decode(msg.sysExData.slice(1))

		let cmdName // e.g. CmdSetEffectsJson
		try {
			cmdName = Object.entries(this).filter(([_, val]) => errorCmd == val)[0][0]
		} catch(_) {}

		console.error(cmdName, "error", "|", "channel", msg.channel, "|", errorMsg)
	}
}
