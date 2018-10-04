import { h, Component } from 'preact';

import effectTypes from './effect-types';

import EditField from './edit-field';
import List from './list';

import style from './style';

export default class Detail extends Component {
	updateType = (newType) => {
		this.props.onChange({"Type": newType})
	}

	updateParams = (newParams) => {
		this.props.onChange(Object.assign(this.props.effect, {Effect: newParams}))
	}

	updateParam = (key, newValue) => {
		this.props.effect.Effect[key] = newValue
		console.log("updateParam", key, newValue)
		this.props.onChange(this.props.effect)
	}

	render({ effect }) {
		const params = Object.entries(effect.Effect || {})

		return <div class={style.effectDetail}>
			<select class={style.effectType} value={effect.Type} onChange={(e) => this.updateType(e.target.value)}>
				{ effectTypes.map((type) => <option value={type}>{type}</option>) }
			</select>

			{ effect.Controls &&
				<div class={style.effectControls}>
					{this.renderControls(effect)}
				</div> }

			{ params.length > 0 &&
				<div class={style.effectParams}>
					{params.map(([key, value]) => this.renderValue(value, key))}
				</div> }
		</div>
	}

	renderValue(value, key) {
		if(key == 'Effects')
			return <div>{this.renderParamName(key)}<br/><List items={value || []} onChange={(effects) => this.updateParams({Effects: effects})} /></div>
		else if(key == 'Color')
			return <div>{this.renderParamName(key)}<br/><span class={style.color} style={value && `background-color: rgb(${value[0]}, ${value[1]}, ${value[2]})`}></span></div>
		else
			return <div>{this.renderParamName(key)}<br/><EditField name={key} value={value} onChange={this.updateParam.bind(null, key)} /></div>
	}

	renderParamName(key) {
		return <p style="text-align:left;font-size:1.2em;font-weight:bold;padding:0;margin:1em 0em 0em 0em">{key}</p>
	}

	renderControls(effect) {
		const { Controls } = effect
		return <div class={style.controlSet}>
			{Controls.map((c) => this.renderControl(c))}
		</div>
	}

	renderControl(control) {
		const type = control.Type
		const params = (control.Control || {})
		const subControls = (control.Controls)
		return <div class={style.controlEnvelope}>
			<span class={style.controlType}>{ type.replace(/Control$/, '') }</span>
			<ul class={style.controlParams}>
				{ Object.keys(params).map((key) => <li>
					{ key }: { JSON.stringify(params[key]) }
				</li>) }
			</ul>
			{ subControls && subControls.length > 0 ? this.renderControls(control) : null }
		</div>
	}
}
