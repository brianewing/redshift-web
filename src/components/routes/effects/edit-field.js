import { h, Component } from 'preact';

import { Slider } from 'preact-range-slider';
import ColorPicker from 'coloreact';

import style from './style';

export default class EditField extends Component {
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
		} else if(name == 'xColor') {
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
