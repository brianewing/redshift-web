import addEventMethods from './lib/event-methods'

export default class Stream {
	channel = 0

	constructor(connection) {
		addEventMethods(this) // on, off, emit

		this.connection = connection
		this.pixelBuffer = []
	}

	close() { this.connection.closeStream(this.channel) }

	setFps(fps) { this.connection.setStreamFps(this.channel, fps) }
	setEffectsFps(fps) { this.connection.setEffectsStreamFps(this.channel, fps) }

	setEffects(effects) { this.connection.setEffects(this.channel, effects) }
	setEffectsJson(json) { this.connection.setEffectsJson(this.channel, json) }
	setEffectsYaml(yaml) { this.connection.setEffectsYaml(this.channel, yaml) }

	appendEffects(effects) { this.connection.appendEffects(this.channel, effects) }
	appendEffectsJson(json) { this.connection.appendEffectsJson(this.channel, json) }
	appendEffectsYaml(yaml) { this.connection.appendEffectsYaml(this.channel, yaml) }

	updateEffectsInPlace(path, effects) { this.connection.updateEffectsInPlace(this.channel, path, effects) }

	repl(cmd) {
		this.connection.sendReplCommand(this.channel, cmd)
	}

	handle(msg) {
		if(msg.command == 0) {
			this.unpackPixels(msg.data)
			this.emit('pixels', this.pixelBuffer)
			// this.setFps(0)
		} else if(msg.command == 255) { // system exclusive command
			this.handleSysEx(msg)
		}
	}

	handleSysEx(msg) {
		if(msg.sysExCommand == this.connection.CmdSetEffectsJson) {
			const jsonString = new TextDecoder("utf-8").decode(msg.sysExData)
			this.emit('effects', JSON.parse(jsonString))
		} else if(msg.sysExCommand == this.connection.CmdRepl) {
			const response = new TextDecoder("utf-8").decode(msg.sysExData)
			this.emit('repl', response)
		} else {
			console.error('unrecognised sysex command', msg.sysExCommand, msg)
		}
	}

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
