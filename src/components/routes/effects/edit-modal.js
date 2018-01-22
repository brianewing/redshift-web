import { h, Component } from 'preact';

import { Slider } from 'preact-range-slider';

import Modal from '../../modal';

import style from './style';

export default class EditModal extends Component {
	shouldComponentUpdate() {
		return true
	}

	render({ onTypeChange, onFieldChange, effect, onClose, onEdit }) {
		const type = effect.Type
		const params = Object.entries(effect.Params || {})

		return <Modal onClose={onClose}>
			<div class={style.edit}>
				<strong>
					Edit
					<select onChange={(e) => onTypeChange(e.target.value)}>
						{TYPES.map((type) => <option name={type}>{type}</option>)}
					</select>
				</strong>

				{ params.length > 0 ? <ul class={style.editFields}>
						{params.map(([name, value]) => <li class={style.editField}>
							<label for={name}>{name}</label>
							<EditField name={name} value={value} onChange={onFieldChange.bind(this, name)} />
						</li>)}
					</ul> : <div>This effect has no parameters!</div> }
			</div>
		</Modal>
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

const TYPES = [
	"BlueEffect",
	"Brightness",
	"Buffer",
	"Clear",
	"External",
	"Fill",
	"Layer",
	"LarsonEffect",
	"MoodEffect",
	"Null",
	"RainbowEffect",
	"RandomEffect",
	"Stripe"
]
