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
		let canvas = this.canvas
		let parentNode = canvas.parentNode
		let pixelRatio = (window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1)
    // pixelRatio = 1

		if(canvas.width != parentNode.clientWidth * pixelRatio || canvas.height != parentNode.clientHeight * pixelRatio) {
			canvas.width = (parentNode.clientWidth * pixelRatio)
			canvas.height = (parentNode.clientHeight * pixelRatio)
			canvas.style.width = `${parentNode.clientWidth}px`
			canvas.style.height = `${parentNode.clientHeight}px`
		}

		if(this.props.stream.pixelBuffer)
			this.renderFrame(this.props.stream.pixelBuffer)
	}

	renderFrame = (buffer) => {
		if(!this.ctx || !this.ctx.fillRect)
			return console.error("Context not ready", ctx)

		let { ctx, canvas } = this
		let { reverse } = this.props

		let len = buffer.length

		let ledWidth = canvas.width / len
		let ledHeight = canvas.height

    ledWidth *= len / Math.sqrt(len)
    ledHeight /= Math.sqrt(len)

		let gapWidth = Math.floor(ledWidth / 40)
		gapWidth = 1

		for(let i=0; i<len; i++) {
			let led = (reverse ? buffer[len - i - 1] : buffer[i])

      let x = Math.floor(i % Math.sqrt(len))
      let y = Math.floor(i / Math.sqrt(len))

			// led
			ctx.fillStyle = `rgb(${led[0]}, ${led[1]}, ${led[2]})`
			ctx.fillRect(ledWidth*x, ledHeight*y, ledWidth, ledHeight)

			// gap
			ctx.fillStyle = '#000000'
			ctx.fillRect(ledWidth*x - gapWidth, ledHeight*y, gapWidth, ledHeight)
			ctx.fillRect(ledWidth*x, ledHeight*y - gapWidth, ledWidth, gapWidth)

      continue // skip stroke

			// stroke
			ctx.fillStyle = 'rgba(255,255,255,0.38)'

      // left
      ctx.fillRect(
        ledWidth*x + 1,
        ledHeight*y + 1,
        1,
        ledHeight)

      // right
      ctx.fillRect(
        ledWidth*x + ledWidth - 1 - gapWidth,
        ledHeight*y,
        1,
        ledHeight)

      // top
      ctx.fillRect(
        ledWidth*x,
        ledHeight*y,
        ledWidth - 2,
        1)

      // bottom
      ctx.fillRect(
        ledWidth*x,
        ledHeight*y - 1,
        ledWidth,
        1)
		}
	}
}
