import { Component } from 'preact'

import style from './style'

export default class LEDStrip extends Component {
	render() {
		let buffer = this.props.buffer || []

		return <div class={style.strip}>
			{buffer.map(this.renderLed)}
		</div>
	}

	renderLed(rgb) {
		let bg = `background-color: rgb(${rgb.join(',')})`
		return <div class={style.led} style={bg}></div>
	}
}