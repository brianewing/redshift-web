import { h, Component } from 'preact'

import LEDStrip from '../../led-strip'

import style from './style'

export default class Remote extends Component {
	render({ buffer, off }) {
		return <div class={style.home}>
			<LEDStrip buffer={buffer} paused={off} />
		</div>
	}
}
