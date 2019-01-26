import { h, Component } from 'preact';

import FaAsterisk from 'react-icons/lib/fa/asterisk';
import FaFloppyO from 'react-icons/lib/fa/floppy-o';
import FaPlusSquareO from 'react-icons/lib/fa/plus-square-o';
import FaFolderOpenO from 'react-icons/lib/fa/folder-open-o';
import FaRefresh from 'react-icons/lib/fa/repeat';
import MdAutorenew from 'react-icons/lib/md/autorenew';
import MdCached from 'react-icons/lib/md/cached';

import basicContext from 'basiccontext';

import Modal from '../../modal';
import { fetch as fetchEffects, load as loadEffects, save as saveEffects } from '../../../effect-definitions';

import ListItem from './list-item';

import style from './style';

export default class List extends Component {
	change = (modificationFn) => {
		const { items, onChange } = this.props
		const newItems = modificationFn(items)
		newItems && onChange(newItems)
	}

	add = (newEffect, index=null) => {
		if(index == null) {
			index = this.props.items.length
		}
		this.change((items) => {
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

	reset = () => this.change(() => [{"Type": "Clear"}])

	toggleDisabled = (index) => {
		this.change((items) => {
			items[index].Disabled = !items[index].Disabled
			return items
		})
	}

	replace = (index, replacement) => {
		this.change((items) => {
			items[index] = replacement
			return items
		})
	}

	addClicked = (e) => {
		if(this.props.availableEffects) {
			const menu = this.props.availableEffects.map((name) => {
				return {title: name, fn: () => this.add({"Type": name})}
			})
			basicContext.show(menu, e)
		} else {
			this.add(this.props.items.length)
		}
	}

	openMouseEnter = (e) => {
		// preload effects filenames
		this.openFilenamesPromise = fetchEffects().then((filenames) => {
			return filenames.map((f) => decodeURIComponent(f.name))
		})
	}

	openMouseLeave = () => this.openFilenamesPromise = null

	openClicked = (e) => {
		if(!this.openFilenamesPromise)
			this.openMouseIn()

		this.openFilenamesPromise.then((filenames) => {
			const menu = filenames.map((f) => {
				return {title: f, fn: (e) => this.loadEffectsFile(f, e.altKey)}
			})

			basicContext.show([{title: "New", fn: this.reset}, {}, ...menu], e)
		})
	}

	loadEffectsFile = (filename, append=false) => {
		const { stream } = this.props

		loadEffects('/' + filename).then((data) => {
			if(filename.endsWith('.json')) {
				const newEffects = JSON.parse(data)
				this.change((items) => append ? [items, ...newEffects] : newEffects)
			} else if(filename.endsWith('.yaml')) {
				append ? stream.appendEffectsYaml(data) : stream.setEffectsYaml(data)
			}
		})
	}

	saveClicked = () => this.setState({ saving: true })
	saveSubmitted = (filename) => {
		saveEffects(filename, JSON.stringify(this.props.items))
		this.setState({ saving: false })
	}

	restartClicked = () => this.change((items) => items)

	handleDragStart = (e) => {

	}

	handleDragOver = (e) => {
		console.log('Drag over!', e)
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	handleDrop = (e) => {
		console.log('Drop!', e)
		console.log(e.getData())
	}

	render({ items, selection, availableEffects }, { shade, saving }) {
		return <ul class={shade ? style.shade : ''}>
			<li class={style.effectListHeader}>
				{ saving && <SaveDialog onClose={() => this.setState({ saving: false })} onSave={this.saveSubmitted} /> }

				<button style="float:left" onClick={this.reset}>New</button>
				<button style="float:left" onMouseEnter={this.openMouseEnter} onMouseLeave={this.openMouseLeave} onClick={this.openClicked}><FaFolderOpenO /></button>
				<button style="float:left" onClick={this.saveClicked}><FaFloppyO /></button>

				<button onClick={this.restartClicked}><MdCached /></button>
				<button onClick={this.addClicked}><FaPlusSquareO /></button>
			</li>

			{ items && items.map((value, index) =>
				<ListItem effect={value} index={index}
					isFirst={index==0} isLast={index==items.length-1} isSelected={index==selection}
					availableEffects={availableEffects}
					onClick={this.props.onSelection && this.props.onSelection.bind(null, index)}
					onToggleDisabled={this.toggleDisabled.bind(null, index)}
					onMove={this.move.bind(null, index)}
					onDuplicate={this.duplicate.bind(null, index)}
					onReplace={this.replace.bind(null, index)}
					onRemove={this.remove.bind(null, index)} />) }
		</ul>
	}
}

class SaveDialog extends Component {
	componentDidUpdate() {
		this.inputEl.focus()
	}

	onSubmit = (e) => {
		e.preventDefault()
		const filename = '/' + e.currentTarget.querySelector('input').value + '.json'

		this.props.onSave(filename)
		this.props.onClose()
	}

	render({ onClose }) {
		return <Modal onClose={onClose}>
			<div style="text-align: center">
				<h2>Save Effect Set</h2>
				<p><em>Choose a filename</em></p>
				<form onSubmit={this.onSubmit}>
					<input style="width: 15em" ref={(el) => this.inputEl = el} placeholder={new Date().toISOString().split('T')[0]} />
					{/* &nbsp;.json */}
				</form>
			</div>
		</Modal>
	}
}