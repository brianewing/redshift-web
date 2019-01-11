import { h, Component } from 'preact';

import DetailField from './detail-field';
import EffectSetEditor from './effect-set-editor';

import MdArrowBack from 'react-icons/md/arrow-back';

import ControlSetEditor from './control-set-editor';

import style from './style';

export default class Detail extends Component {
	updateType = (newType) => {
		this.props.onChange({ Type: newType })
	}

	updateParams = (newParams) => {
		this.props.onChange(Object.assign(this.props.effect, { Effect: newParams }))
	}

	updateParam = (key, newValue) => {
		this.props.effect.Effect[key] = newValue
		this.props.onChange(this.props.effect)
	}

	updateControls = (newControls) => {
		this.props.onChange(Object.assign(this.props.effect, { Controls: newControls }))
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

			<br />

			<ControlSetEditor controls={effect.Controls} effectParams={effect.Effect} onChange={this.updateControls} />

			<p>{this.renderEffectDescription()}</p>

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
		else if(key.endsWith('Effect') || key.endsWith('Effects'))
			return <div>
				{/* {this.renderParamName(key)}<br/> */}
				<EffectSetEditor effects={value || []} availableEffects={this.props.availableEffects} stream={null} onChange={this.updateParam.bind(null, key)} />
			</div>
		else
			return <div>
				{this.renderParamName(key)}<br/>
				<DetailField name={key} value={value} onChange={this.updateParam.bind(null, key)} />
			</div>
	}

	renderParamName(key) {
		return <p style="text-align:center;font-size:1.1em;font-weight:bold;padding:0;margin:1em 0em 0em 0em">{key}</p>
	}
}