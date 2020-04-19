import { h, Component } from 'preact';
import { Slider } from 'preact-range-slider';

import basicContext from 'basiccontext';
import ColorPicker from 'coloreact';

import style from './style';

import BretSlider from '../../bret-slider';

export default class DetailField extends Component {
	onChange = (value) => {
		this.props.onChange(value)
	}

	onInput = (e) => {
		this.props.onChange(e.target.value)
	}

	showOscAddressDropdown = (e) => {
		const { oscSummary } = this.props
		const oscAddresses = Object.keys(oscSummary || {})

		if(oscAddresses.length === 0)
			basicContext.show([
				{title: 'No messages received so far', disabled: true}
			], e)
		else
			basicContext.show(oscAddresses.map((a) => {
				return {title: a, fn: () => this.onChange(a)}
			}), e)
	}

	render({ name, value }) {
		// todo: send field constraint info from server

		if(typeof value == 'number') {
			const step = (name == 'Speed' ? 0.01 : 1)
			const max = {
				Argument: 16,
				Speed: 5,
				Size: 1500,
				Offset: 1500,
				Depth: 20,
				R: 2, G: 2, B: 2,
			}[name] || 255

			// return <Slider min={0} max={max} step={step} vertical={false} dots={true} value={value} onChange={this.onChange} />
			// return <input type="number" name={name} value={value} onInput={this.onInput} />

			return <BretSlider name={name} value={value} onChange={this.onChange}
						step={step} max={max} />
		} else if(typeof value == 'boolean') {
			return <button style="width:100%" data-toggle data-toggled={value} onClick={this.onChange.bind(null, !value)}>{name}</button>
		} else if(name == 'Address') {
			return <div>
				<input name={name} value={value} onInput={this.onInput} />
				<button onClick={this.showOscAddressDropdown}>
					*
				</button>
			</div>
		} else if(name == 'Color') {
			const toArray = ({ rgb }) => [rgb.r, rgb.g, rgb.b]
			const currentValue = value ? `rgb(${value.join(',')})` : null
			return <div><ColorPicker style="width:100%;height:100px;position:relative" color={currentValue} onChange={(c) => this.onChange(toArray(c))} /></div>
		} else if(name.startsWith('Blend')) {
			return 
		} else if(name == 'Transform') {
			return <textarea name={name} onInput={this.onInput}>{value}</textarea>
		} else if(typeof name == "object") {
			return <pre>{ JSON.stringify(value) }</pre>
		} else {
			return <input name={name} value={value} onInput={this.onInput} />
		}
	}
}
