import { h, Component } from 'preact';

import { Slider } from 'preact-range-slider';

import Modal from '../../modal';

import style from './style';

export default class EditModal extends Component {
	shouldComponentUpdate() {
		return true
	}

	onFieldChange = (name, newValue) => {
		const { onEdit } = this.props
		console.log('onFieldChange', name, newValue)
		onEdit(name, newValue)
	}

	render({ effect, onClose, onEdit }) {
		const type = effect.Type
		const params = Object.entries(effect.Params)

		return <Modal onClose={onClose}>
			<div class={style.edit}>
				<strong>Edit {type}</strong>

				{ params.length > 0
					? <ul class={style.editFields}>
						{params.map(([name, value]) => {
							return this.renderField(name, value)
						})}
					</ul> : <div>This effect has no parameters!</div> }
			</div>
		</Modal>
	}

	renderField(name, value) {
		return <li class={style.editField}>
			<label for={name}>{name}</label>
			<EditField name={name} value={value} onChange={this.onFieldChange.bind(this, name)} />
		</li>
	}
}

class EditField extends Component {
	onChange = (value) => {
		this.props.onChange(value)
	}

	onInput = (e) => {
		this.props.onChange(e.target.value)
	}

	render({ name, value }) {
		switch(typeof value) {
			case 'number':
				// these heuristics will be removed - the server should define min/max/step
				const step = (name == 'Size' || name == 'Position' ? 1 : 0.1)
				const max = (name == 'Speed' ? 5 : 255)
				return <Slider min={0} max={max} step={step} value={value} onChange={this.onChange} />
			case 'boolean':
				return <strong style="display:block" onClick={this.onChange.bind(null, !value)}>{value.toString()}</strong>
			default:
				return <input name={name} value={value} onInput={this.onInput} />
		}
	}
}
