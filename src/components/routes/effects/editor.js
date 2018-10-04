import { h, Component } from 'preact';

import Modal from '../../modal';

import style from './style';

export default class Editor extends Component {
	shouldComponentUpdate() {
		return true
	}

	render({ onTypeChange, effect, onClose, onEdit }) {
		const params = Object.entries(effect.Effect || {})

		return <div class={style.edit}>
			<strong>
				<select onChange={(e) => onTypeChange(e.target.value)}>
					{TYPES.map((type) => <option name={type} selected={type == effect.Type}>{type}</option>)}
				</select>
			</strong>

			{ params.length > 0 ? <ul class={style.editFields}>
					{params.map(([name, value]) => this.renderField(name, value))}
				</ul> : <div>This effect has no parameters!</div> }
		</div>
	}

	renderField(name, value) {
		const { onFieldChange } = this.props
		if(name == 'Effects' || name.startsWith('Blend')) {
			return null // not shown in edit modal
		}
		return <li class={style.editField}>
			<label for={name}>{name}</label>
			<EditField name={name} value={value} onChange={onFieldChange && onFieldChange.bind(this, name)} />
		</li>
	}
}
