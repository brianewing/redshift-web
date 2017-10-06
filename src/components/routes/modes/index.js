import { h, Component } from 'preact';
import style from './style';

export default class Modes extends Component {
	render({}, { }) {
		return (
			<div class={style.modes}>
				<p>
					<img src="/assets/spongebob.png" />
				</p>
			</div>
		);
	}
}
