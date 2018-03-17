import { h, Component } from 'preact';
import linkState from 'linkstate';

import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

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
import MdLooks from 'react-icons/lib/md/looks';

import style from './style';

export default class Effects extends Component {
	state = {
		effects: []
	}

	componentWillReceiveProps(props) {
		this.setState({ effects: props.effects })
	}

	send = () => this.props.onSend && this.props.onSend(this.state.effects)

	addNewEffect = () => {
		const { effects } = this.state
		this.setState({ effects: [...(effects || []), { Type: "Null" }]})
		this.send()
		console.log(this.state.effects)
	}

	onSortEnd = ({oldIndex, newIndex}) => {
		this.onChange(arrayMove(this.state.effects, oldIndex, newIndex))
	}

	onChange = (effects) => {
		this.setState({ effects })
		this.send()
	}

	render({}, { effects }) {
		return <div class={style.effects}>
			<h2>Effects</h2>
			<button onClick={() => this.addNewEffect()}>
				Add New Effect
			</button>

			{<List items={effects} onChange={this.onChange} />}
		</div>
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

	showMenu = (e) => {
		const { isFirst, isLast } = this.props
		basicContext.show([
			{title: 'Move Up', fn: () => this.props.onMove(-1), disabled: isFirst},
			{title: 'Move Down', fn: () => this.props.onMove(1), disabled: isLast},
			{title: 'Remove', fn: () => this.props.onRemove()},
		], e)
	}

	onTypeChange = (newType) => {
		const { onTypeChange } = this.props
		onTypeChange(newType)
	}

	onFieldChange = (field, newValue) => {
		const { onFieldChange, effect  } = this.props
		effect.Params[field] = newValue
		onFieldChange(effect)
	}

	render({ effect }, { edit }) {
		const params = Object.entries(effect.Params || {})

		return <li class={style.effect} onDblClick={this.showEditModal} onContextMenu={this.showMenu}>
			<div class={style.effectName}>
				{this.renderIcon(effect)} <strong>{effect.Type}</strong>
			</div>

			{params.length > 0 && <div class={style.effectParams}>
				{params.map(([key, value]) => this.renderValue(value, key))}
			</div>}

			{ edit ? <EffectEditModal effect={effect}
				onClose={this.hideEditModal}
				onFieldChange={this.onFieldChange}
				onTypeChange={this.onTypeChange}
			/> : null}
		</li>
	}

	renderIcon(effect) {
		switch(effect['Type']) {
			case 'Brightness': return <MdBrightness5 />
			case 'Clear': return <FaEraser />
			case 'External': return <FaCode />
			case 'LarsonEffect': return <FaCab />
			case 'Layer': return <FaClone />
			case 'RainbowEffect': return <MdLooks />
			case 'Stripe': return <FaEllipsisH />
			default: return <FaSquareO />
		}
	}

	renderValue(value, key) {
		if(key == 'Effects')
			return <List items={value} />
		else
			return <div><strong> {key}</strong> {JSON.stringify(value)}</div>
	}
}
