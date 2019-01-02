import { h, Component } from 'preact';

// import effectTypes from './effect-types';

import DetailField from './detail-field';
import EffectSetEditor from './effect-set-editor';

import MdArrowBack from 'react-icons/md/arrow-back';

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
		this.props.onChange(this.props.effect)
	}

	render({ availableEffects, effect, onBackButton }) {
		const params = Object.entries(effect.Effect || {})

		return <div class={style.effectDetail}>
			<div onClick={onBackButton} class={style.detailMobileNav}>
				<MdArrowBack />
			</div>

			<select class={style.effectType} value={effect.Type} onChange={(e) => this.updateType(e.target.value)}>
				{ availableEffects.map((type) => <option value={type}>{type}</option>) }
			</select>

			<p><i>{this.renderEffectDescription()}</i></p>

			{ effect.Controls && this.renderControls(effect) }

			<div class={style.effectParams}>
				{ params.length > 0
						? params.map(([key, value]) => this.renderValue(value, key))
						: <p>This effect has no parameters</p> }
			</div>
		</div>
	}

	renderEffectDescription() {
		switch(this.props.effect.Type) {
			case "Clear": return "Resets the buffer";
			case "RainbowEffect": return "A smooth moving rainbow pattern";
			case "LarsonEffect": return "A bar that moves back and forth across the strip";
		}
	}

	renderValue(value, key) {
		if(key == 'Blend')
			return
		else if(key == 'Effects')
			return <div>
				{this.renderParamName(key)}<br/>
				<EffectSetEditor effects={value || []} availableEffects={this.props.availableEffects} stream={null} onChange={this.updateParam.bind(null, key)} />
			</div>
		else
			return <div>
				{this.renderParamName(key)}<br/>
				<DetailField name={key} value={value} onChange={this.updateParam.bind(null, key)} />
			</div>
	}

	renderParamName(key) {
		return <p style="text-align:left;font-size:1.1em;font-weight:bold;padding:0;margin:1em 0em 0em 0em">{key}</p>
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
