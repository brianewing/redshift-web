import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import style from './style';

export default class Cinema extends Component {
	showMenu = (e) => {
		const { onSavePng } = this.props
		const noop = () => {}

		basicContext.show([
			{title: 'Save as PNG', fn: onSavePng || noop, disabled: !onSavePng},
		], e)
	}

	render({ onClick }) {
		return <div class={style.cinema} onClick={onClick} onContextMenu={this.showMenu}></div>
	}
}
