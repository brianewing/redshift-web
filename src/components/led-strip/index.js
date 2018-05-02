import { Component } from 'preact'

import Timings from '../../lib/timings'

import style from './style'

// let i = 0

export default class LEDStrip extends Component {
	static defaultProps = {
		fps: 60
	}

	componentWillMount() {
		this.requestNextFrame()
		// this.timings = new Timings(`LEDStrip[${i++}]`).startLogging()
	}

	componentDidUpdate() {
		this.requestNextFrame()
	}

	componentWillUnmount() {
		this.props.buffer = null
		this.cancelNextFrame()
		// this.timings.stopLogging()
	}

	render() {
		return <div class={style.strip + ' ' + this.props.class}>
			<canvas ref={this.setCanvas}></canvas>
		</div>
	}

	setCanvas = (el) => {
		if(!el) return;
		this.canvas = el
		this.ctx = el.getContext('2d')
	}

	adjustCanvas = () => {
		let canvas = this.canvas
		let parentNode = canvas.parentNode
		let pixelRatio = (window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1)

		if(canvas.width != parentNode.clientWidth * pixelRatio || canvas.height != parentNode.clientHeight * pixelRatio) {
			canvas.width = (parentNode.clientWidth * pixelRatio)
			canvas.height = (parentNode.clientHeight * pixelRatio)
			canvas.style.width = `${parentNode.clientWidth}px`
			canvas.style.height = `${parentNode.clientHeight}px`
		}
	}

	requestNextFrame = () => {
		this.nextFrameTimeout = setTimeout(this.nextFrameCallback, this.nextFrameDelta())
		// this.nextFrameTimeout = requestAnimationFrame(this.nextFrameCallback)
	}

	nextFrameCallback = () => {
		if(this.props.paused || !this.props.buffer)
			return;

		this.adjustCanvas()
		this.renderFrame()
		this.requestNextFrame()
	}

	nextFrameDelta = () => {
		let { fps } = this.props

		let target = (1000 / fps)
		let lastFrame = (this.lastFrameTime || 0)
		let now = Date.now()

		let timeout = Math.max(0, target - (now - lastFrame))
		this.lastFrameTime = now + timeout

		return timeout
	}

	cancelNextFrame = () => {
		if(!this.nextFrameTimeout)
			return;

		clearTimeout(this.nextFrameTimeout)
		this.nextFrameTimeout = null
	}

	renderFrame = () => {
		if(!this.ctx || !this.ctx.fillRect)
			return console.error("Context not ready", ctx)

		let { ctx, canvas } = this
		let { buffer, reverse } = this.props

		let len = buffer.length

		let ledWidth = canvas.width / len
		let ledHeight = canvas.height

		for(let i=0; i<len; i++) {
			let led = (reverse ? buffer[len - i - 1] : buffer[i])

			ctx.fillStyle = `rgb(${led.join(',')})`
			ctx.fillRect(ledWidth*i, 0, ledWidth, ledHeight)

			ctx.fillStyle = '#000000'
			ctx.fillRect(ledWidth*i - 4, 0, 4, ledHeight)

			ctx.fillStyle = 'rgba(255,255,255,0.28)'
			ctx.fillRect(ledWidth*i + 1, 1, 1, ledHeight) // left
			ctx.fillRect(ledWidth*i + ledWidth - 6, 0, 1, ledHeight) // right
			ctx.fillRect(ledWidth*i + 1, 0, ledWidth - 2, 1) // top
			ctx.fillRect(ledWidth*i, ledHeight - 1, ledWidth, 1) // bottom
		}
	}
}
