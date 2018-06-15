import { h, Component } from 'preact';
import linkState from 'linkstate';

import basicContext from 'basiccontext';

import EffectEditModal from './edit-modal';

import FaAutomobile from 'react-icons/lib/fa/automobile';
import FaCab from 'react-icons/lib/fa/cab';
import FaClone from 'react-icons/lib/fa/clone';
import FaCircleThin from 'react-icons/lib/fa/circle-thin';
import FaCode from 'react-icons/lib/fa/code';
import FaEraser from 'react-icons/lib/fa/eraser';
import FaEllipsisH from 'react-icons/lib/fa/ellipsis-h';
import FaLightbulbO from 'react-icons/lib/fa/lightbulb-o';
import FaSquareO from 'react-icons/lib/fa/square-o';

import MdBrightness5 from 'react-icons/lib/md/brightness-5';
import MdFlip from 'react-icons/lib/md/flip';
import MdLooks from 'react-icons/lib/md/looks';
import MdLinearScale from 'react-icons/lib/md/linear-scale';

import style from './style';

const EFFECTS_FPS = 10

/*
 * Receives effects JSON from stream and allows user
 * to add, remove and change effects
 */

export default class Effects extends Component {
	state = {
		effects: [],
		oscSummary: {},
	}

	oscSummaryInterval = null

	componentWillMount() {
		const { stream } = this.props
		if(stream) {
			stream.setEffectsFps(EFFECTS_FPS)
			stream.on('effects', this.receiveEffects)
		} else {
			throw new Error("Effects component mounted with null stream")
		}

		this.oscSummaryInterval = setInterval(this.requestOscSummary, 50)
	}

	componentWillUnmount() {
		const { stream } = this.props
		stream.setEffectsFps(0)
		stream.off('effects', this.receiveEffects)

		clearInterval(this.oscSummaryInterval)
	}

	receiveEffects = (effects) => {
		this.setState({ effects })
	}

	requestOscSummary = () => {
		this.props.connection.requestOscSummary().then((summary) => {
			this.setState({ oscSummary: summary })
		})
	}

	send = (effects) => {
		this.props.stream.setEffects(effects)
	}

	addNewEffect = () => {
		const { effects } = this.state
		this.send([...(effects || []), { Type: "Null" }])
	}

	clearEffects = () => {
		this.send([{ Type: "Clear" }])
	}

	render({}, { effects }) {
		return <div class={style.effects}>
			<button onClick={this.clearEffects}>Clear</button>
			<button onClick={this.addNewEffect}>Add</button>

			{this.renderOscSummary()}
			{<List items={effects} onChange={this.send} />}
		</div>
	}

	renderOscSummary() {
		const { oscSummary } = this.state
		return <ul>
			{Object.values(oscSummary).map((oscMsg) => <li>
				<strong>{oscMsg.Address}</strong>
				<pre>{JSON.stringify(oscMsg.Arguments)}</pre>
			</li>)}
		</ul>
	}
}

class List extends Component {
	fieldChange = (index, newEffect) => {
		const { items, onChange } = this.props
		items[index] = newEffect
		onChange(items)
	}

	typeChange = (index, newType) => {
		const { items, onChange } = this.props
		items[index] = { Type: newType }
		onChange(items)
	}

	move = (index, delta) => {
		const { items, onChange } = this.props
		const newIndex = index+delta
		if(newIndex >= 0 && newIndex <= items.length) {
			items.splice(index+delta, 0, items.splice(index, 1)[0])
			onChange(items)
		}
	}

	remove = (index) => {
		const { items, onChange } = this.props
		items.splice(index, 1)
		onChange(items)
	}

	render({ items }) {
		return <ul>
			{items && items.map((value, index) =>
				<Effect effect={value}
					isFirst={index==0} isLast={index==items.length-1}
					onTypeChange={this.typeChange.bind(null, index)}
					onFieldChange={this.fieldChange.bind(null, index)}
					onMove={this.move.bind(null, index)}
					onRemove={this.remove.bind(null, index)} />
			)}
		</ul>
	}
}

class Effect extends Component {
	showEditModal = () => this.setState({ edit: true })
	hideEditModal = () => this.setState({ edit: false })

	toggleControls = () => this.setState({ showControls: !this.state.showControls })
	toggleParams = () => this.setState({ showParams: !this.state.showParams })

	showMenu = (e) => {
		const { isFirst, isLast } = this.props
		basicContext.show([
			{title: 'Move Up', fn: this.moveUp, disabled: isFirst},
			{title: 'Move Down', fn: this.moveDown, disabled: isLast},
			{title: 'Remove', fn: this.remove},
		], e)
	}

	moveUp = () => this.props.onMove(-1)
	moveDown = () => this.props.onMove(1)
	remove = () => this.props.onRemove()

	onTypeChange = (newType) => {
		const { onTypeChange } = this.props
		onTypeChange(newType)
	}

	onFieldChange = (field, newValue) => {
		const { onFieldChange, effect  } = this.props
		effect.Effect[field] = newValue
		onFieldChange(effect)
	}

	toggleDisabled = () => {
		const { onFieldChange, effect } = this.props
		effect.Disabled = !effect.Disabled
		onFieldChange(effect)
	}

	render({ effect }, { edit, showControls, showParams }) {
		const params = Object.entries(effect.Effect || {})
		const disabledClass = (effect.Disabled ? style.disabledEffect : '')

		return <li class={style.effect + ' ' + disabledClass} onDblClick={this.showEditModal} onContextMenu={this.showMenu}>
			<div class={style.effectToolbar}>
				<div class={style.effectName}>
					{this.renderIcon(effect)} <strong>{effect.Type}</strong> {this.renderSummary()}
				</div>

				<div class={style.toolbarButtons}>
					<button onClick={this.toggleDisabled}>{effect.Disabled ? 'Enable' : 'Disable'}</button>
					<button onClick={this.toggleControls}>{showControls ? 'Hide' : 'Show'} Controls</button>
					<button onClick={this.toggleParams}>{showParams ? 'Hide' : 'Show'} Params</button>
					<button onClick={this.moveDown}>&darr;</button>
					<button onClick={this.moveUp}>&uarr;</button>
				</div>
			</div>

			{ effect.Controls && showControls && 
				<div class={style.effectControls}>
					{this.renderControls(effect)}
				</div> }

			{ params.length > 0 && showParams &&
				<div class={style.effectParams}>
					{params.map(([key, value]) => this.renderValue(value, key))}
				</div> }

			{ edit ? <EffectEditModal effect={effect}
				onClose={this.hideEditModal}
				onFieldChange={this.onFieldChange}
				onTypeChange={this.onTypeChange}
			/> : null }
		</li>
	}

	renderSummary() {
		const { Type, Effect } = this.props.effect

		if(Type == 'External')
			return <i>{Effect.Program} {Effect.Args && Effect.Args.join(' ')}</i>
	}

	renderIcon(effect) {
		switch(effect['Type']) {
			case 'Brightness': return <MdBrightness5 />
			case 'Clear': return <FaEraser />
			case 'External': return <FaCode />
			case 'LarsonEffect': return <FaCab />
			case 'Layer': return <FaClone />
			case 'Mirror': return <MdFlip />
			case 'RainbowEffect': return <MdLooks />
			case 'Stripe': return <FaEllipsisH />
			case 'Switch': return <MdLinearScale />
			default: return <FaSquareO />
		}
	}

	renderValue(value, key) {
		if(key == 'Effects')
			return <List items={value} />
		else if(key == 'Color')
			return <div><strong> {key}</strong> <span class={style.color} style={`background-color: rgb(${value[0]}, ${value[1]}, ${value[2]})`}></span></div>
		else
			return <div><strong> {key}</strong> {JSON.stringify(value)}</div>
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
