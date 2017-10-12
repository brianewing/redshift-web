import { h, Component } from 'preact';
import linkState from 'linkstate';
import style from './style';

import GoEllipsis from 'react-icons/lib/go/ellipsis';

export default class Effects extends Component {
	sendCustomJson = () => {
		let { onCustomJson } = this.props
		let { customJson } = this.state
		onCustomJson && onCustomJson(customJson)
	}

	render({ effects }, { customJson }) {
		return (
			<div class={style.effects}>
				{this.renderEffects(effects)}
				<textarea onInput={linkState(this, 'customJson')}></textarea>
				<button onClick={this.sendCustomJson}>Set Effects</button>
			</div>
		);
	}

	renderEffects = (effects) => <ul>
		{effects && effects.map(this.renderEffect)}
	</ul>

	renderEffect = (effect) => <li>
		{this.icon(effect)} <strong>{effect.Type}</strong>
		{ " {" }
			{Object.entries(effect.Params).map(([key, value]) => {
				return <span><strong> {key}</strong> {this.renderValue(value, key)}</span>;
			})}
		{ " }" }
	</li>

	renderValue = (value, key) => {
		if(key == 'Effects')
			return this.renderEffects(value)
		else
			return JSON.stringify(value)
	}

	icon = (effect) => {
		return <GoEllipsis />
	}
}
