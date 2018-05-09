class EventEmitter {
	constructor() {
		this.listeners = {} /* eventName => [fn,..] */
	}

	/* Add listener for eventName */
	on = (eventName, listener) => {
		this.listeners[eventName] = (this.listeners[eventName] || [])
		this.listeners[eventName].push(listener)
	}

	/* Remove listener for eventName */
	off = (eventName, listener) => {
		this.listeners[eventName] = (this.listeners[eventName] || [])
		this.listeners[eventName].splice(this.listeners[eventName].indexOf(listener), 1)
	}

	/* Call listeners for eventName, passing value as first parameter */
	emit = (eventName, value) => {
		this.listeners[eventName] = (this.listeners[eventName] || [])
		for(let i=0; i<this.listeners[eventName].length; i++)
			this.listeners[eventName][i](value)
	}
}

export default function addEventMethods(obj) {
	const emitter = new EventEmitter()
	obj.on = emitter.on
	obj.off = emitter.off
	obj.emit = emitter.emit
}
