import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import DetailField from './detail-field';
import EffectSetEditor from './effect-set-editor';

import MdArrowBack from 'react-icons/md/arrow-back';
import FaArrowCircleOLeft from 'react-icons/fa/arrow-circle-o-left';

import ControlSetEditor from './control-set-editor';

import style from './style';

Array.prototype.flatMap = function(fn) { 
    return Array.prototype.concat.apply([], this.map(fn)); 
};

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

	remove = () => {
		this.props.onRemove()
	}

    addNewControl = (type, field) => {
        this.updateControls([
            ...(this.props.effect.Controls || []),
            { Type: type, Control: { Field: field } }
        ])
	}

	showAddControlMenu = (e) => {
		const chooseType = (e) => {
			return new Promise((resolve, _) => {
				basicContext.show([
					{ title: "Add:", disabled: true },
					{ title: "OSC Control", fn: (e) => resolve([e, 'OscControl']) },
					{ title: "MIDI Control", fn: (e) => resolve([e, 'MidiControl']) },
					{ title: "Time Control", fn: (e) => resolve([e, 'TimeControl']) },
					{ title: "Tween Control", fn: (e) => resolve([e, 'TweenControl']) },
					{ title: "Fixed Value Control", fn: (e) => resolve([e, 'FixedValueControl']) },
				], e)
			})
		}

		const promptFieldChoices = (e, params) => {
			return new Promise((resolve, _) => {
				basicContext.show([
					{ title: "Field:", disabled: true },

					...fieldPaths(params).map(fieldName => {
						return { title: fieldName, fn: () => resolve(fieldName) }
					})
				], e)
			})
		}
		
		const params = this.props.effect.Effect

		chooseType(e).then(([e, type]) => {
			basicContext.close()
			promptFieldChoices(e, params).then(fieldName => {
				this.addNewControl(type, fieldName)
			})
		})
    }

	render({ availableEffects, effect, onBackButton }) {
		const params = Object.entries(effect.Effect || {})
		const description = this.renderEffectDescription()

		return <div class={style.effectDetail}>
            <div class={style.actions}>
                <button onClick={onBackButton} class={style.backButton}><MdArrowBack /> Back</button>
                <button onClick={this.toggleDisabled}>{ effect.Disabled ? 'Enable' : 'Disable' }</button>
                <button onClick={this.remove}>Remove</button>
                <button onClick={this.showAddControlMenu}>Add a Control</button>
            </div>

			<select class={style.effectType} value={effect.Type} onChange={(e) => this.updateType(e.target.value)}>
				{ availableEffects.map((type) => <option value={type}>{type}</option>) }
			</select>

			<br />

			{ description && <p style="padding: 0em 2em; text-align: center">{ description }</p> }

			{ <ControlSetEditor controls={effect.Controls} onChange={this.updateControls} oscSummary={this.props.oscSummary} /> }

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
			case "Scanner", "LarsonEffect": return "A bar that moves back and forth across the strip";
			case "GameOfLife": return "A cellular automaton devised by the British mathematician John Horton Conway in 1970. The game is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input";
			case "": return "";
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
					oscSummary={this.props.oscSummary}
					onChange={this.updateParam.bind(null, key)} />
			</div>
		else
			return <div>
				{this.renderParamName(key, value)}
				<DetailField name={key} value={value} onChange={this.updateParam.bind(null, key)} oscSummary={this.props.oscSummary} />
			</div>
	}

	renderParamName(key, value) {
		if(typeof value == "boolean") {
			return null
		}
		return <p class={style.effectParamName}>{key}</p>
	}
}

// Recursively enumerate all of the effect parameters reachable under `params` (parsed Redshift Effect JSON)
const fieldPaths = (params, prefix='') => {
	// n.b. arrays have typeof "object", numbers typeof "number", strings typeof "string"
	if(typeof params !== "object" || params === null) {
		// If we've reached a value, such as a number, string, or null, return the prefix as a single path
		// e.g. if we are passed (params=50, prefix='Effects[0].Color[0]'), then return 'Effects[0].Color[0]'
		// as a leaf path value that a user might want to address
		return [prefix]
	}

	if("Type" in params && "Effect" in params) {
		// This hides the 'Effect' part of the path from the user, in an attempt
		// to simplify the mental model needed to address nested effects
		//
		// Users will see e.g. Effects[0].Size instead of Effects[0].Effect.Size
		params = params.Effect
	}

	return Object.keys(params).sort().flatMap(paramName => {
		const value = params[paramName]
		const path = prefix ? `${prefix}.${paramName}` : paramName

		if(Array.isArray(value)) {
			return value.flatMap((subParam, i) => {
				return fieldPaths(subParam, `${path}[${i}]`)
			})
		} else if(typeof value === "object" && value !== null) {
			// Recurse and yield this nested object's param paths into the flat map
			return fieldPaths(value, path)
		} else {
			// This value is a number, string, or null (something other than an array or object, anyway!)
			// Return its path as a leaf to be included in the list
			return [path]
		}
	})
}
