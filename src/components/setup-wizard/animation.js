import addEventMethods from '../../lib/event-methods'

export default function bgAnimation(numLeds=60, fps=60) {
	return new Animation(numLeds, [
		new Clear,
		new Mood,
		new MirrorLarson([0, 0, 255]),
		new Example,
		new Example,
	]).start(fps)
}

class Animation {
	constructor(numberOfLeds, effects=[]) {
		this.buffer = new Array(numberOfLeds).fill(null).map(() => [0, 0, 0])
		this.effects = effects
		addEventMethods(this) // on, off, emit
	}

	start(fps) {
		if(!this.interval)
			this.interval = setInterval(this.render, 1000 / fps)
		return this
	}

	stop() {
		if(this.interval)
			clearInterval(this.interval)
		this.interval = null
		return this
	}

	setFps(fps) {
		this.stop().start(fps)
	}

	render = () => {
		for(let i=0; i<this.effects.length; i++) {
			this.effects[i].render(this.buffer)
		}
		this.emit('pixels', this.buffer)
	}
}

class Clear {
	render(buffer) {
		for(let i=0; i<buffer.length; i++) {
			buffer[i] = [0, 0, 0]
		}
	}
}

class Mood {
	color = null
	brightness = 0
	delta = 15

	render(buffer) {
		if(this.brightness <= 0) {
			this.color = this.newColor()
			this.delta = 15
		} else if(this.brightness >= 255) {
			this.delta = -15
		}

		let adjustedColor = this.color.map((x, _) => Math.round(x*this.brightness/255))
		this.brightness += this.delta

		for(let i=0; i<buffer.length; i++)
			buffer[i] = adjustedColor
	}

	newColor() {
		return hexToRgb(string_to_color(window.colorString))
		return [0, 0, 0].map(() => Math.floor(Math.random() * 255))
	}
}

class MirrorLarson {
	constructor(color) {
		this.color = color
		this.position = 0
		this.direction = 1 // -->
	}

	render(buffer) {
		if(this.position >= buffer.length / 2)
			this.direction = -1
		else if(this.position <= 0)
			this.direction = 1

		this.position += this.direction

		buffer[this.position] = this.color
		buffer[buffer.length-this.position-1] = this.color
		// this.changeColor()
	}

	changeColor() {
		const i = Math.floor(Math.random() * this.color.length)
		const delta = Math.floor((Math.random() - 0.5) * 50)
		this.color[i] = Math.min(255, Math.max(0, this.color[i] + delta))
		// console.log('change', i, delta, this.color[i])
	}
}

class Example {
	position = 0
	color = [255, 100, 50]
	brightness = 255
	factor = 0.95

	constructor(color) {
		if(color)
			this.color = color

		// this.factor = 0.1 + (Math.random() * 0.1)
		this.factor = 0.99
	}

	render(buffer) {
		if(Math.random() > this.factor) {
			this.position = Math.floor(Math.random() * buffer.length)
			this.brightness = 255
			// this.brightness += 40
		} else if(this.brightness > 0) {
			this.brightness -= 3
		}

		MirrorLarson.prototype.changeColor.apply(this)
		const color = this.color.map((c) => Math.floor(c/255*this.brightness))

		buffer[this.position] = color
		buffer[buffer.length-this.position-1] = color
	}
}

class Random {
	render(buffer) {
		for(let i=0; i<buffer.length; i++) {
			if(Math.random() > 0.99)
			buffer[i] = buffer[i].map(() => Math.floor(Math.random() * 255))
		}
	}
}

/********************************************************
Name: str_to_color
Description: create a hash from a string then generates a color
Usage: alert('#'+str_to_color("Any string can be converted"));
author: Brandon Corbin [code@icorbin.com]
website: http://icorbin.com
********************************************************/

function string_to_color(str, prc) {
	'use strict';

	// Check for optional lightness/darkness
	var prc = typeof prc === 'number' ? prc : -10;

	// Generate a Hash for the String
	var hash = function(word) {
		var h = 0;
		for (var i = 0; i < word.length; i++) {
			h = word.charCodeAt(i) + ((h << 5) - h);
		}
		return h;
	};

	// Change the darkness or lightness
	var shade = function(color, prc) {
		var num = parseInt(color, 16),
			amt = Math.round(2.55 * prc),
			R = (num >> 16) + amt,
			G = (num >> 8 & 0x00FF) + amt,
			B = (num & 0x0000FF) + amt;
		return (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
			(G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
			(B < 255 ? B < 1 ? 0 : B : 255))
			.toString(16)
			.slice(1);
	};

	// Convert init to an RGBA
	var int_to_rgba = function(i) {
		var color = ((i >> 24) & 0xFF).toString(16) +
			((i >> 16) & 0xFF).toString(16) +
			((i >> 8) & 0xFF).toString(16) +
			(i & 0xFF).toString(16);
		return color;
	};

	return shade(int_to_rgba(hash(str)), prc);

}

function hexToRgb(hex) {
	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	return [r, g, b];
}

window.string_to_color = string_to_color
window.colorString = "hello"
