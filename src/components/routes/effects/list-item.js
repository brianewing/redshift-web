import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import renderIcon from './icons';
import style from './style';

export default class ListItem extends Component {
	showMenu = (e) => {
		const { isFirst, isLast } = this.props
		const isDisabled = this.props.effect.Disabled

		basicContext.show([
			{title: 'Move Up', fn: this.moveUp, disabled: isFirst},
			{title: 'Move Down', fn: this.moveDown, disabled: isLast},
			{},
			{title: 'Wrap in...', fn: this.showWrapInMenu},
			{title: 'Change type...', fn: this.showChangeTypeMenu},
			{},
			{title: (isDisabled ? 'Enable' : 'Disable'), fn: this.toggleDisabled},
			{},
			{title: 'Duplicate', fn: this.duplicate},
			{title: 'Remove', fn: this.remove},
		], e)
	}

	showWrapInMenu = (e) => {
		basicContext.close()
		basicContext.show([
			{title: 'Layer', fn: () => this.wrapIn('Layer')},
			{title: 'Layout', fn: () => this.wrapIn('Layout')},
			{title: 'Mirror', fn: () => this.wrapIn('Mirror')},
			{title: 'Resettable', fn: () => this.wrapIn('Resettable')},
			{title: 'Switch', fn: () => this.wrapIn('Switch')},
			{title: 'Toggle', fn: () => this.wrapIn('Toggle')},
		], e)
	}

	showChangeTypeMenu = (e) => {
		basicContext.close()
		basicContext.show(this.props.availableEffects.map((name) => {
			return {title: name, fn: () => this.changeType(name)}
		}), e)
	}

	moveUp = () => this.props.onMove(-1)
	moveDown = () => this.props.onMove(1)
	duplicate = () => this.props.onDuplicate()
	remove = () => this.props.onRemove()
	toggleDisabled = () => this.props.onToggleDisabled()

	wrapIn = (effectType) => {
		this.props.onReplace({
			Type: effectType,
			Effect: {
				Effects: [this.props.effect]
			}
		})
	}

	changeType = (newType) => {
		this.props.onReplace(Object.assign(this.props.effect, { Type: newType }))
	}

	onClick = (e) => {
		if(e.ctrlKey && !e.shiftKey)
			this.moveDown()
		else if(e.shiftKey && !e.ctrlKey)
			this.moveUp()
		else if(e.shiftKey && e.ctrlKey && !e.altKey)
			this.toggleDisabled()
		else if(e.shiftKey && e.ctrlKey && e.altKey)
			this.remove()
		else if(this.props.onClick)
			this.props.onClick()
	}

	onDragStart = (e) => {
		const effectData = JSON.stringify(this.props.effect)
		e.dataTransfer.dropEffect = 'none'
		e.dataTransfer.setData('application/x-redshift-effect-envelope', effectData)
	}

	onDragEnd = (e) => {
		if(e.dataTransfer.dropEffect == 'move')
			this.remove()
	}

	render({ effect, isSelected }, { }) {
		const classes = [
			(isSelected ? style.selected : ''),
			(effect.Disabled ? style.disabledEffect : ''),
			style.effectListItem
		].join(' ')

		return <li class={classes} onClick={this.onClick} onDblClick={this.toggleDisabled} onContextMenu={this.showMenu}>
			<div class={style.effectToolbar}>
				<div class={style.effectName}>
					{renderIcon(effect.Type)} <strong>{effect.Type}</strong> {this.renderSummary()}
				</div>

				<div class={style.toolbarButtons} onClick={(e) => e.stopPropagation()}>
					<button onClick={this.toggleDisabled}>{effect.Disabled ? 'Enable' : 'Disable'}</button>
					<button onClick={this.remove}>Remove</button>
					<button onClick={this.moveDown}>&darr;</button>
					<button onClick={this.moveUp}>&uarr;</button>
				</div>
			</div>
		</li>
	}

	renderSummary() {
		const { Type, Effect } = this.props.effect

		if(Type == 'External') {
			return <i>{Effect.Program} {Effect.Args && Effect.Args.join(' ')}</i>
		} else if(Type == 'Script') {
			return <i>&rarr;{Effect.Name} {Effect.Args && Effect.Args.join(' ')}</i>
		} else if(Array.isArray(Effect.Effects)) {
			const enabledSubEffects = Effect.Effects.filter((e) => !e.Disabled)
			return <i>&rarr;{enabledSubEffects.map(({ Type }) => Type).join(', ')}</i>
		}
	}
}
