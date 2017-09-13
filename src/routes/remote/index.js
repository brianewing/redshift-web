import { h, Component } from 'preact'

import LEDStrip from '../../components/led-strip'

import style from './style'

export default class Remote extends Component {
	render({ stripBuffer }) {
		return <div class={style.home}>
			<LEDStrip buffer={stripBuffer} />
		</div>
	}
}
