import { h, Component } from 'preact';

import basicContext from 'basiccontext';
import Collapse from 'rc-collapse';

import FaPlusSquareO from 'react-icons/lib/fa/plus-square-o';

import Modal from '../../modal';

import DetailField from './detail-field';

import style from './style';

export default class ControlSetEditor extends Component {
    send = (controls) => {
        this.props.onChange(controls)
    }

    updateParam = (control, key, newValue) => {
        control.Control[key] = newValue
        this.props.onChange(this.props.controls)
    }

    toggleDisabled = (control) => {
        control.Disabled = !control.Disabled
        this.props.onChange(this.props.controls)
    }

    removeControl = (control) => {
        this.props.onChange(this.props.controls.filter((c) => c != control))
    }

    addNewControl = (type, field) => {
        this.send([
            ...(this.props.controls || []),
            { Type: type, Control: { Field: field } }
        ])
	}

	showAddControlMenu = (e) => {
        const chooseField = (controlType, e2) => {
            const fieldNames = Object.keys(this.props.effectParams).filter((name) => {
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
    
    render({ controls, actions = {}, effectIsDisabled }, { selectedControl }) {
		return <div class={style.controlSet}>
            <div class={style.actions}>
                <button onClick={actions.back} class={style.backButton}>&larr; Back</button>
                <button onClick={actions.toggleEffect}>{ effectIsDisabled ? 'Enable' : 'Disable' }</button>
                <button onClick={this.showAddControlMenu}>Add a Control</button>
            </div>

            {/* { controls && controls.map((c) => {
                return <button style="width:100%" onClick={() => this.setState({ selectedControl: c })}>{ this.renderControlDescription(c) }</button>
            }) }

            { selectedControl && <Modal onClose={() => this.setState({ selectedControl: null })}>
                { this.renderControl(selectedControl) }
            </Modal> }
 */}
			<Collapse accordion={true}>
                <Collapse.Panel header={'Controls' + ((controls||[]).length > 0 ? ` (${controls.length})` : '')}>

					{ controls && <Collapse accordion={true}>
                            {controls.map((c) => {
                                return <Collapse.Panel header={this.renderControlDescription(c)}>
                                    {this.renderControl(c)}
                                </Collapse.Panel>
                            })}
                        </Collapse> }

				</Collapse.Panel>
			</Collapse>
		</div>
	}

	renderControl(control) {
        const params = (control.Control || {})
        
		return <div class={style.controlEnvelope}>
			<ul class={style.controlParams}>
				{ Object.keys(params).map((key) => <li class={style.controlParam}>
                    <strong class={style.controlParamName}>{ key }</strong>
                    <DetailField name={key} value={params[key]} onChange={this.updateParam.bind(null, control, key)} />
				</li>) }
			</ul>

            <button onClick={this.toggleDisabled.bind(null, control)}>{ control.Disabled ? 'Enable' : 'Disable' }</button>
            <button onClick={this.removeControl.bind(null, control)}>Remove</button>
			{/* { subControls && subControls.length > 0 ? this.renderControls(control) : null } */}
		</div>
	}

	renderControlDescription(control) {
        const type = {OscControl: "OSC", MidiControl: "MIDI", TweenControl: "Tween", TimeControl: "Time"}[control.Type] || "Unknown"
		return type + (control.Control.Field ? ` Control - ${control.Control.Field}` : '')
	}
}