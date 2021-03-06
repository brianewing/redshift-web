// Contains methods for building and parsing OpenPixelControl messages,
// including Redshift system exclusive commands

const opcMessage = { // all messages are parsed into this object to reduce allocation
	channel: null,
	command: null,
	length: null,
	data: null,

	sysExCommand: null,
	sysExData: null,
}

export const systemId = 65535

export function parseOpcMessage(buffer) {
	const view = new DataView(buffer)

	opcMessage.channel = view.getUint8(0)
	opcMessage.command = view.getUint8(1)
	opcMessage.length = view.getUint16(2)
	opcMessage.data = new Uint8Array(buffer, 4)

	if(opcMessage.command == 255) {
		opcMessage.sysExCommand = view.getUint8(6)
		opcMessage.sysExData = new Uint8Array(buffer, 7)
	} else {
		opcMessage.sysExCommand = null
		opcMessage.sysExData = null
	}

	return opcMessage
}

// Creates a binary OPC message, returned as an ArrayBuffer
// Data parameter must be an Array, ArrayBuffer or DataView (of bytes)
// (spec @ openpixelcontrol.org)
export function buildOpcMessage(channel, command, data=[]) {
	const dataLength = (data.length || data.byteLength || 0)
	const msg = new ArrayBuffer(4 + dataLength)
	const view = new DataView(msg)

	view.setUint8(0, channel)
	view.setUint8(1, command)
	view.setUint16(2, dataLength)
	new Uint8Array(msg, 4).set(data)

	return msg
}

// Creates a binary OPC message representing a Redshift sysex command
// Data parameter must be an Array, ArrayBuffer or DataView (of bytes)
export function buildSysExOpcMessage(channel, sysExCommand, sysExData=[]) {
	const sysEx = new ArrayBuffer(3 + (sysExData.length || sysExData.byteLength || 0))
	const view = new DataView(sysEx)

	view.setUint16(0, systemId)
	view.setUint8(2, sysExCommand)
	new Uint8Array(sysEx, 3).set(sysExData)

	return buildOpcMessage(channel, 255, new Uint8Array(sysEx))
}
