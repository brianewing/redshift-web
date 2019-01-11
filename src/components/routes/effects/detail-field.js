import { h, Component } from 'preact';

import { Slider } from 'preact-range-slider';
import ColorPicker from 'coloreact';

import style from './style';

export default class DetailField extends Component {
	onChange = (value) => {
		this.props.onChange(value)
	}

	onInput = (e) => {
		this.props.onChange(e.target.value)
	}

	render({ name, value }) {
		// todo: send field constraint info from server

		if(typeof value == 'number') {
			const step = (name == 'Speed' ? 0.01 : 1)
			const max = {
				Speed: 3,
				Size: 1500,
				Depth: 20,
				R: 2, G: 2, B: 2,
			}[name] || 255

			return <Slider min={0} max={max} step={step} value={value} onChange={this.onChange} />
		} else if(typeof value == 'boolean') {
			return <strong style="display:block" onClick={this.onChange.bind(null, !value)}>{value.toString()}</strong>
		} else if(name == 'Color') {
			const toArray = ({ rgb }) => [rgb.r, rgb.g, rgb.b]
			const currentValue = value ? `rgb(${value.join(',')})` : null
			return <div><ColorPicker style="width:100%;height:100px;position:relative" color={currentValue} onChange={(c) => this.onChange(toArray(c))} /></div>
		} else if(name.startsWith('Blend')) {
			return 
		} else {
			return <input name={name} value={value} onInput={this.onInput} />
		}
	}
}
