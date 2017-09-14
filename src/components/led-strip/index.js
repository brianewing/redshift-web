import { Component } from 'preact'

import style from './style'

let RECALC = true

window.onresize = () => {
	RECALC = true
}

export default class LEDStrip extends Component {
	width = 0

	recalcWidth = () => {
		let margin = 3
		let buffer = this.props.buffer || []
		this.width = (document.body.clientWidth - (margin * buffer.length)) / buffer.length
	}

	render() {
		let buffer = this.props.buffer || []

		return <div class={style.strip}>
			{buffer.map((led) => this.renderLed(led))}
		</div>

		// return <div class={style.strip}>
			// {buffer.map(this.renderLed)}
		// </div>
	}

	renderLed(rgb, width) {
		if(RECALC) this.recalcWidth();

		let bg
		if(this.width) bg = `background-color: rgb(${rgb.join(',')}); width: ${this.width}px;`
		else bg = `background-color: rgb(${rgb.join(',')});`

		return <div class={style.led} style={bg}></div>
	}
}