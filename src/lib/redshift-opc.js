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
		opcMessage.sysExCommand = view.getUint8(4)
		opcMessage.sysExData = new Uint8Array(buffer, 7)
	} else {
		opcMessage.sysExCommand = null
		opcMessage.sysExData = null
	}
	return opcMessage
}

// Creates a binary OPC message, returned as an ArrayBuffer
// Data parameter must be an Array, ArrayBuffer or DataView (bytes)
// (spec @ openpixelcontrol.org)
export function buildOpcMessage(channel, command, data) {
	const dataLength = (data.length || data.byteLength) // can be array, buffer or dataview
	const msg = new ArrayBuffer(4 + (data.length || data.byteLength))
	const view = new DataView(msg)

	view.setUint8(0, channel)
	view.setUint8(1, command)
	view.setUint16(2, (data.length || data.byteLength))
	new Uint8Array(msg, 4).set(data)

	return msg
}

// Redshift sysex data is itself encoded as an opc message without the leading channel byte
export function buildSysExOpcMessage(channel, sysExCommand, sysExDataBytes) {
	const sysexData = new Uint8Array(buildOpcMessage(0, sysExCommand, sysExDataBytes), 1)
	const msg = buildOpcMessage(channel, 255, sysexData)

	// replace length bytes with system id (see spec @ openpixelcontrol.org)
	new DataView(msg).setUint16(2, systemId)

	return msg
}
