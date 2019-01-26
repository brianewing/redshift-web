import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import DetailField from './detail-field';
import EffectSetEditor from './effect-set-editor';

import MdArrowBack from 'react-icons/md/arrow-back';
import FaArrowCircleOLeft from 'react-icons/fa/arrow-circle-o-left';

import ControlSetEditor from './control-set-editor';

import style from './style';

export default class Detail extends Component {
	updateType = (newType) => {
		// this.props.onChange({ Type: newType })
		this.props.onChange(Object.assign({}, this.props.effect, { Type: newType }))
	}

	updateParams = (newParams) => {
		this.props.onChange(Object.assign(this.props.effect, { Effect: newParams }))
	}

	updateParam = (key, newValue) => {
		this.props.effect.Effect[key] = newValue
		this.props.onChange(this.props.effect)
	}

	updateControls = (newControls) => {
		this.props.onChange(Object.assign({}, this.props.effect, { Controls: newControls }))
	}

	toggleDisabled = () => {
		this.props.onChange(Object.assign({}, this.props.effect, { Disabled: !this.props.effect.Disabled }))
	}

    addNewControl = (type, field) => {
        this.updateControls([
            ...(this.props.effect.Controls || []),
            { Type: type, Control: { Field: field } }
        ])
	}

	showAddControlMenu = (e) => {
        const chooseField = (controlType, e2) => {
            const fieldNames = Object.keys(this.props.effect.Effect).filter((name) => {
                return ['Effects'].indexOf(name) == -1
            })
            basicContext.close()
            basicContext.show([
                { title: "Field:", disabled: true },
                ...fieldNames.map((field) => {
                    return { title: field, fn: () => this.addNewControl(controlType, field) }
                })
            ], e2)
        }

		basicContext.show([
			{ title: "Add:", disabled: true },
			{ title: "OSC Control", fn: (e) => chooseField('OscControl', e) },
			{ title: "MIDI Control", fn: (e) => chooseField('MidiControl', e) },
			{ title: "Time Control", fn: (e) => chooseField('TimeControl', e) },
			{ title: "Tween Control", fn: (e) => chooseField('TweenControl', e) },
			{ title: "Fixed Value Control", fn: (e) => chooseField('FixedValueControl', e) },
		], e)
    }

	render({ availableEffects, effect, onBackButton }) {
		const params = Object.entries(effect.Effect || {})
		const description = this.renderEffectDescription()

		return <div class={style.effectDetail}>
            <div class={style.actions}>
                <button onClick={onBackButton} class={style.backButton}><MdArrowBack /> Back</button>
                <button onClick={this.toggleDisabled}>{ effect.Disabled ? 'Enable' : 'Disable' }</button>
                <button onClick={this.showAddControlMenu}>Add a Control</button>
            </div>

			<select class={style.effectType} value={effect.Type} onChange={(e) => this.updateType(e.target.value)}>
				{ availableEffects.map((type) => <option value={type}>{type}</option>) }
			</select>

			<br />

			{ <ControlSetEditor controls={effect.Controls} onChange={this.updateControls} /> }

			{ description && <p>{ description }</p> }

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
				<EffectSetEditor effects={value || []} stream={null}
					preventWide={true}
					availableEffects={this.props.availableEffects}
					onChange={this.updateParam.bind(null, key)} />
			</div>
		else
			return <div>
				{this.renderParamName(key)}<br/>
				<DetailField name={key} value={value} onChange={this.updateParam.bind(null, key)} />
			</div>
	}

	renderParamName(key) {
		return <p class={style.effectParamName}>{key}</p>
	}
}