import { h, Component } from 'preact';
import linkState from 'linkstate';
import style from './style';

export default class Effects extends Component {
	sendCustomJson = () => {
		let { onCustomJson } = this.props
		let { customJson } = this.state
		onCustomJson && onCustomJson(customJson)
	}

	render({ effects }, { customJson }) {
		return (
			<div class={style.effects}>
				<h1>Effects</h1>
				<pre>{JSON.stringify(effects)}</pre>

				<h2>Custom</h2>
				<textarea onInput={linkState(this, 'customJson')}></textarea>
				<button onClick={this.sendCustomJson}>Why are we here why is there anything at all</button>
			</div>
		);
	}
}
