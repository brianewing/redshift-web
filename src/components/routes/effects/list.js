import { h, Component } from 'preact';
import { route } from 'preact-router';

import FaFloppyO from 'react-icons/lib/fa/floppy-o';
import FaPlusSquareO from 'react-icons/lib/fa/plus-square-o';
import FaFolderOpenO from 'react-icons/lib/fa/folder-open-o';

import basicContext from 'basiccontext';

import Modal from '../../modal';

import ListItem from './list-item';

import style from './style';

export default class List extends Component {
	change = (modificationFn) => {
		const { items, onChange } = this.props
		const newItems = modificationFn(items)
		newItems && onChange(newItems)
	}

	add = (index=0) => {
		this.change((items) => {
			const newEffect = {Type: "Null"}
			return [...items.slice(0, index), newEffect, ...items.slice(index)]
		})
	}

	move = (index, delta) => {
		this.change((items) => {
			const newIndex = index+delta
			if(newIndex >= 0 && newIndex <= items.length) {
				items.splice(index+delta, 0, items.splice(index, 1)[0])
				return items
			}
		})
	}

	duplicate = (index) => {
		this.change((items) => {
			const copy = JSON.parse(JSON.stringify(items[index]))
			return [...items.slice(0, index), copy, ...items.slice(index)]
		})
	}

	remove = (index) => {
		this.change((items) => {
			return [...items.slice(0, index), ...items.slice(index+1)]
		})
	}

	reset = () => this.change(() => [])

	toggleDisabled = (index) => {
		this.change((items) => {
			items[index].Disabled = !items[index].Disabled
			return items
		})
	}

	addClicked = (index) => {
		this.add(this.props.items.length)
		route('/effects/' + this.props.items.length)
	}

	openClicked = (e) => {
		let a = [
			{title: "effects.osc.yaml", fn: () => 5},
			{title: "effects.15.yaml", fn: () => 5},
			{title: "rainbow.yaml", fn: () => 5},
			{title: "osc2.yaml", fn: () => 5},
		]
		basicContext.show([
			{title: "New", fn: () => this.reset()},
			{},
			...a,...a,...a,...a,...a,...a,
			...a,...a,...a,...a,...a,...a,
			...a,...a,...a,...a,...a,...a,
			...a,...a,...a,...a,...a,...a,
		], e, () => {
			basicContext.close()
		})
	}

	saveClicked = () => this.setState({ saving: true })

	render({ items, selection }, { shade, saving }) {
		return <ul class={shade ? style.shade : ''}>
			<li class={style.effectListHeader}>
				<button style="float:left" onClick={this.openClicked}><FaFolderOpenO /></button>
				<button style="float:left" onClick={this.saveClicked}><FaFloppyO /></button>
				<button onClick={this.addClicked}><FaPlusSquareO /></button>
				{ saving && <Modal onClose={() => this.setState({saving: false})}>
					<div style="text-align: center">
						<h1 style="margin:0">Save Effects</h1>
						<br/>
						<input placeholder={new Date().toISOString().split('T')[0]} />&nbsp;.yaml
					</div>
				</Modal> }
			</li>

			{items && items.map((value, index) =>
				<ListItem effect={value}
					isFirst={index==0} isLast={index==items.length-1} isSelected={index==selection}
					onClick={this.props.onSelection && this.props.onSelection.bind(null, index)}
					onToggleDisabled={this.toggleDisabled.bind(null, index)}
					onMove={this.move.bind(null, index)}
					onDuplicate={this.duplicate.bind(null, index)}
					onRemove={this.remove.bind(null, index)} />
			)}
		</ul>
	}
}
