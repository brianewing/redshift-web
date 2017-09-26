export default class Timings {
	constructor(label) {
		this.label = label
		this.intervals = []
	}

	start = () => {
		this.startedAt = performance.now()
	}

	finish = () => {
		this.add(performance.now() - this.startedAt)
		this.startedAt = null
	}

	add = (ms) => {
		this.intervals.push(ms)
	}

	startLogging = (ms) => {
		this.stopLogging()
		this._logTimer = setInterval(this.log, ms || 1000)
		return this
	}

	stopLogging = () => {
		if(this._logTimer) {
			clearInterval(this._logTimer)
			this._logTimer = null
		}
		return this
	}

	log = () => {
		let sum = 0, length = this.intervals.length
		if(!length) return

		for(let i=0; i<length; i++)
			sum += this.intervals[i]

		console.debug(this.label || '', length, sum / length)
		this.intervals.length = 0
	}
}