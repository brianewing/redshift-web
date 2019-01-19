import { Component } from 'preact'
import style from './style'

export default class LEDStrip extends Component {
	componentWillMount() {
		if(!this.props.stream)
			throw new Error("LEDStrip mounted with null stream")

		window.addEventListener('resize', this.adjustCanvas)
	}

	componentWillUnmount() {
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
		this.ctx = el.getContext('2d')
	}

	adjustCanvas = () => {
		const canvas = this.canvas
		const parentNode = canvas.parentNode
		const pixelRatio = (window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1)
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

		const ledWidth = canvas.width / Math.sqrt(len)
		const ledHeight = canvas.height / Math.sqrt(len)

		// const gapWidth = Math.floor(ledWidth / 40)
		const gapWidth = 0.5

		for(let i=0; i<len; i++) {
			const led = (reverse ? buffer[len - i - 1] : buffer[i])
			
			const x = Math.floor(i % Math.sqrt(len))
			const y = Math.floor(i / Math.sqrt(len))

			// led
			ctx.fillStyle = `rgb(${led[0]}, ${led[1]}, ${led[2]})`
			ctx.fillRect(ledWidth*x, ledHeight*y, ledWidth, ledHeight)

			// continue

			// // stroke
			ctx.lineWidth = gapWidth
			// ctx.strokeStyle = 'rgba(0,0,0,0.55)'
			ctx.strokeStyle = 'rgba(0,0,0,0.55)'
			ctx.strokeRect(ledWidth*x, ledHeight*y, ledWidth, ledHeight)
		}
	}
}
