import addEventMethods from "./lib/event-methods";

class Config {
	constructor() {
		addEventMethods(this)
	}

	get = (key) => localStorage.getItem(key)
	set = (key, value) => {
		localStorage.setItem(key, value)
		this.emit(key, value)
	}

	get host() { return this.get('host') || location.hostname }
	set host(host) { return this.set('host', host) }

	get bufferFps() { return +(this.get('bufferFps') || 25) }
	set bufferFps(fps) { return this.set('bufferFps', fps) }

	get autoHideHeader() { return Boolean(this.get('autoHideHeader')) }
	set autoHideHeader(autoHide) { this.set('autoHideHeader', (autoHide ? 'true' : '')) }
}

export default new Config