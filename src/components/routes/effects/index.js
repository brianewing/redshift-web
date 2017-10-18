import { h, Component } from 'preact';
import linkState from 'linkstate';
import style from './style';

import Editor from '../scripts/editor';

import GoEllipsis from 'react-icons/lib/go/ellipsis';

export default class Effects extends Component {
	componentWillReceiveProps(props) {
		let { customJson } = this.state
		if(!customJson && props.effects) {
			customJson = JSON.stringify(props.effects, null, '    ')
			this.setState({ customJson })
		}
	}

	sendCustomJson = () => {
		let { customJson } = this.state
		let { onCustomJson } = this.props
		onCustomJson && onCustomJson(customJson)
	}

	editorChangeHandler = (newText) => {
		try { JSON.parse(newText) }
		catch(err) { return; }

		this.setState({customJson: newText})
		this.sendCustomJson()
	}

	render({ effects }, { customJson }) {
		return <div class={style.effects}>
			{customJson && <Editor
				filename="effects"
				mode="javascript"
				content={customJson}
				onSave={this.editorChangeHandler}
				onChange={this.editorChangeHandler} />}
		</div>
	}

	/* Not in use */
	renderEffects = (effects) => <ul>{effects && effects.map(this.renderEffect)}</ul>

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

	icon = (effect) => <GoEllipsis />
}
