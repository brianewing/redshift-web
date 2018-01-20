import { h, Component } from 'preact';
import linkState from 'linkstate';

import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

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
			{<List items={effects} transitionDuration={0} onSortStart={this.onSortStart} onSortEnd={this.onSortEnd} onChange={this.onChange} />}
		</div>
	}
}

// @SortableContainer
class List extends Component {
	effectChanged = (index, newEffect) => {
		console.log("effect changed!", index, newEffect)
		const { items, onChange } = this.props
		items[index] = newEffect
		onChange(items)
	}

	render({ items }) {
		return <ul>
			{items && items.map((value, index) => <Effect index={index} value={value} onChange={this.effectChanged.bind(null, index)} />)}
		</ul>
	}
}

// @SortableElement
class Effect extends Component {
	showEditModal = () => this.setState({ edit: true })
	hideEditModal = () => this.setState({ edit: false })

	onEdit = (field, newValue) => {
		const { onChange, value  } = this.props
		value.Params[field] = newValue
		onChange(value)
	}

	render({ value }, { edit }) {
		const params = Object.entries(value.Params)

		return <li class={style.effect} onClick={this.showEditModal}>
			{ edit ? <EffectEditModal effect={value}
				onClose={this.hideEditModal}
				onEdit={this.onEdit}
			/> : null}

			<div class={style.effectName}>
				{this.renderIcon(value)} <strong>{value.Type}</strong>
			</div>
			{params.length > 0 && <div class={style.effectParams}>
				{params.map(([key, value]) => this.renderValue(value, key))}
			</div>}
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
