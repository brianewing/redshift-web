import { Component } from 'preact'
import style from './style'

export default class LEDStrip extends Component {
	componentWillMount() {
		const { stream } = this.props
		if(stream) {
			stream.on('pixels', this.renderFrame)
		} else {
			throw new Error("LEDStrip mounted with null stream")
		}
		window.addEventListener('resize', this.adjustCanvas)
	}

	componentWillUnmount() {
		const { stream } = this.props
		stream.off('pixels', this.renderFrame)
		window.removeEventListener('resize', this.adjustCanvas)
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

	renderFrame = (buffer) => {
		if(!this.ctx || !this.ctx.fillRect)
			return console.error("Context not ready", ctx)

		let { ctx, canvas } = this
		let { reverse } = this.props

		let len = buffer.length

		let ledWidth = canvas.width / len
		let ledHeight = canvas.height

		for(let i=0; i<len; i++) {
			let led = (reverse ? buffer[len - i - 1] : buffer[i])

			// led
			ctx.fillStyle = `rgb(${led[0]}, ${led[1]}, ${led[2]})`
			ctx.fillRect(ledWidth*i, 0, ledWidth, ledHeight)

			// gap
			ctx.fillStyle = '#000000'
			ctx.fillRect(ledWidth*i - 4, 0, 4, ledHeight)

			// stroke
			ctx.fillStyle = 'rgba(255,255,255,0.38)'
			ctx.fillRect(ledWidth*i + 1, 1, 1, ledHeight) // left
			ctx.fillRect(ledWidth*i + ledWidth - 6, 0, 1, ledHeight) // right
			ctx.fillRect(ledWidth*i + 1, 0, ledWidth - 2, 1) // top
			ctx.fillRect(ledWidth*i, ledHeight - 1, ledWidth, 1) // bottom
		}
	}
}
