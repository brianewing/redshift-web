import { h, Component } from 'preact';

import Collapse from 'rc-collapse';

import DetailField from './detail-field';

import {
    FaPlusSquareO
 } from 'react-icons/fa';
 
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

    duplicate = (control) => {
        const index = this.props.controls.indexOf(control)
        if(index !== -1) {
			const copy = JSON.parse(JSON.stringify(items[index]))
			this.props.onChange([...items.slice(0, index), copy, ...items.slice(index)])
        }
    }

    removeControl = (control) => {
        this.props.onChange(this.props.controls.filter((c) => c != control))
    }
   
    render({ controls }) {
		return <div class={style.controlSet}>
			{/* <Collapse accordion={true}> */}
                {/* <Collapse.Panel header={'Controls' + ((controls||[]).length > 0 ? ` (${controls.length})` : '')}> */}
					{ controls && <Collapse accordion={true}>
                            {controls.map((c) => {
                                return <Collapse.Panel header={this.renderControlDescription(c)}>
                                    {this.renderControl(c)}
                                </Collapse.Panel>
                            })}
                        </Collapse> }
				{/* </Collapse.Panel> */}
			{/* </Collapse> */}
		</div>
	}

	renderControl(control) {
        const params = (control.Control || {})

        const error = params.Error
        delete params.Error
        
		return <div class={style.controlEnvelope}>
			<ul class={style.controlParams}>
				{ Object.keys(params).map((key) => <li class={style.controlParam}>
                    <strong class={style.controlParamName}>{ key }</strong>
                    <DetailField name={key} value={params[key]} onChange={this.updateParam.bind(null, control, key)} oscSummary={this.props.oscSummary} />
				</li>) }
			</ul>

            <button style="display:flex;flex:1" onClick={this.toggleDisabled.bind(null, control)}>{ control.Disabled ? 'Enable' : 'Disable' }</button>
            <button style="display:flex;flex:1" onClick={this.duplicate.bind(null, control)}>Duplicate</button>
            <button style="display:flex;flex:1" onClick={this.removeControl.bind(null, control)}>Remove</button>
			{/* { subControls && subControls.length > 0 ? this.renderControls(control) : null } */}
		</div>
	}

	renderControlDescription(control) {
        const { Field, Address } = control.Control
        const type = {
            OscControl: "OSC",
            MidiControl: "MIDI",
            TweenControl: "Tween",
            TimeControl: "Time",
            FixedValueControl: "Fixed Value",
        }[control.Type] || control.Type
		return type + (Field ? ` Control - ${Field}` : '') + (Address ? ` (${Address})` : '')
	}
}
