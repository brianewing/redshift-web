import { Component } from 'preact'
import style from './style'

export default class LEDStrip extends Component {
	componentWillMount() {
		window.addEventListener('resize', this.adjustCanvas)
	}

	componentWillUnmount() {
		if(this.props.stream)
			this.props.stream.off('pixels', this.renderFrame)

		window.removeEventListener('resize', this.adjustCanvas)
	}

	componentWillReceiveProps(newProps) {
		if(this.props.stream)
			this.props.stream.off('pixels', this.renderFrame)

		newProps.stream.on('pixels', this.renderFrame)
	}

	componentDidMount() {
		this.adjustCanvas()
	}

	render() {
		return <div class={style.strip + ' ' + this.props.class}>
			<canvas ref={this.setCanvas}></canvas>
		</div>
	}

	setCanvas = (el) => {
		if(!el) return;
		this.canvas = el
		this.ctx = el.getContext('2d', { alpha: false })
	}

	adjustCanvas = () => {
		const canvas = this.canvas
		const parentNode = canvas.parentNode
		const pixelRatio = (window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1)
		// alert(pixelRatio)
		// const pixelRatio = 1

		if(canvas.width != parentNode.clientWidth * pixelRatio || canvas.height != parentNode.clientHeight * pixelRatio) {
			canvas.width = (parentNode.clientWidth * pixelRatio)
			canvas.height = (parentNode.clientHeight * pixelRatio)

			// re-render the last frame after adjusting the canvas size
			const { pixelBuffer } = this.props.stream
			if(pixelBuffer)
				this.renderFrame(pixelBuffer)
		}
	}

	renderFrame = (buffer) => {
		if(!this.ctx || !this.ctx.fillRect)
			return console.error("Context not ready", this, this.ctx)

		const { ctx, canvas } = this
		const { reverse } = this.props

		const len = buffer.length

		const rows = Math.sqrt(len)
		const cols = rows

		const ledWidth = canvas.width / rows
		const ledHeight = canvas.height / cols
		// const ledWidth = Math.floor(canvas.width / rows)
		// const ledHeight = Math.floor(canvas.height / cols)

		// const gapWidth = Math.floor(ledWidth / 40)
		// const gapWidth = 2.8
		// const gapWidth = 1 / window.devicePixelRatio
		// const gapWidth = 10
		const gapWidth = 1
		const gap = window.devicePixelRatio * 2

		// ctx.lineWidth = gapWidth
		// ctx.strokeStyle = 'rgba(0,0,0,1)'

		for(let i=0; i<len; i++) {
			const led = (reverse ? buffer[len - i - 1] : buffer[i])

			const x = Math.floor(i % Math.sqrt(len))
			const y = Math.floor(i / Math.sqrt(len))

			// led
			// ctx.fillStyle = 'rgb(' + led.join(',') + ')'
			// ctx.fillStyle = `#${led[0].toString(16).padStart(2, '0')}${led[1].toString(16).padStart(2, '0')}${led[2].toString(16).padStart(2, '0')}`
			ctx.fillStyle = `rgb(${led[0]}, ${led[1]}, ${led[2]})`
			ctx.fillRect(ledWidth*x + gap, ledHeight*y + gap, ledWidth - gap, ledHeight - gap)

			continue

			// // stroke
			// ctx.lineWidth = gapWidth
			// no - ctx.strokeStyle = 'rgba(0,0,0,0.55)'
			// ctx.strokeStyle = 'rgba(0,0,0,1)'
			// no - ctx.strokeStyle = 'rgba(255,255,255,0.25)'
			ctx.strokeRect(ledWidth*x, ledHeight*y, ledWidth, ledHeight)
		}
	}
}
