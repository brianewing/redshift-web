import { h, Component } from 'preact';

import { Slider } from 'preact-range-slider';
import ColorPicker from 'coloreact';

import Modal from '../../modal';

import style from './style';

export default class EditModal extends Component {
	shouldComponentUpdate() {
		return true
	}

	render({ onTypeChange, effect, onClose, onEdit }) {
		const params = Object.entries(effect.Effect || {})

		return <Modal onClose={onClose}>
			<div class={style.edit}>
				<strong>
					<select onChange={(e) => onTypeChange(e.target.value)}>
						{TYPES.map((type) => <option name={type} selected={type == effect.Type}>{type}</option>)}
					</select>
				</strong>

				{ params.length > 0 ? <ul class={style.editFields}>
						{params.map(([name, value]) => this.renderField(name, value))}
					</ul> : <div>This effect has no parameters!</div> }
			</div>
		</Modal>
	}

	renderField(name, value) {
		const { onFieldChange } = this.props
		if(name == 'Effects' || name.startsWith('Blend')) {
			return null // not shown in edit modal
		}
		return <li class={style.editField}>
			<label for={name}>{name}</label>
			<EditField name={name} value={value} onChange={onFieldChange.bind(this, name)} />
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
		// these heuristics will be removed - server should define parameter types
		if(typeof value == 'number') {
			const step = (name == 'Speed' ? 0.001 : 1)
			const max = (name == 'Speed' ? 5 : (name == 'Size' ? 500 : 255))
			return <Slider min={0} max={max} step={step} value={value} onChange={this.onChange} />
		} else if(typeof value == 'boolean') {
			return <strong style="display:block" onClick={this.onChange.bind(null, !value)}>{value.toString()}</strong>
		} else if(name == 'Color') {
			const toArray = ({ rgb }) => {
				console.log('color change', rgb)
				return [rgb.r, rgb.g, rgb.b]
			}
			const currentValue = (value ? `rgb(${value.join(',')})` : null)
			return <div><ColorPicker color={currentValue} onChange={(c) => this.onChange(toArray(c))} /></div>
		} else {
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
	"Greyscale",
	"Layer",
	"LarsonEffect",
	"Mirror",
	"MoodEffect",
	"Null",
	"RainbowEffect",
	"RandomEffect",
	"Slideshow",
	"Stripe",
	"Strobe",
	"Switch",
	"Toggle",
	"Wheee",
]
