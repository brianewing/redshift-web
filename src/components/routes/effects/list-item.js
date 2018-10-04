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
			{title: (isDisabled ? 'Enable' : 'Disable'), fn: this.toggleDisabled},
			{},
			{title: 'Duplicate', fn: this.duplicate},
			{title: 'Remove', fn: this.remove},
		], e)
	}

	moveUp = () => this.props.onMove(-1)
	moveDown = () => this.props.onMove(1)
	duplicate = () => this.props.onDuplicate()
	remove = () => this.props.onRemove()
	toggleDisabled = () => this.props.onToggleDisabled()

	onClick = (e) => {
		if(e.ctrlKey && !e.shiftKey)
			this.moveDown()
		else if(e.shiftKey && !e.ctrlKey)
			this.moveUp()
		else if(e.shiftKey && e.ctrlKey && !e.altKey)
			this.toggleDisabled()
		else if(e.shiftKey && e.ctrlKey && e.altKey)
			this.remove()
		else
			this.props.onClick()
	}

	render({ effect, isSelected }, { }) {
		const classes = [
			(isSelected ? style.selected : ''),
			(effect.Disabled ? style.disabledEffect : ''),
			style.effectListItem
		].join(' ')

		return <li class={classes} onClick={this.onClick} onDblClick={this.showEditModal} onContextMenu={this.showMenu}>
			<div class={style.effectToolbar}>
				<div class={style.effectName}>
					{renderIcon(effect.Type)} <strong>{effect.Type}</strong> {this.renderSummary()}
				</div>

				<div class={style.toolbarButtons}>
					{/*<button onClick={this.toggleDisabled}>{effect.Disabled ? 'Enable' : 'Disable'}</button>*/}
					<button onClick={this.moveDown}>&darr;</button>
					<button onClick={this.moveUp}>&uarr;</button>
				</div>
			</div>
		</li>
	}

	renderSummary() {
		const { Type, Effect } = this.props.effect

		if(Type == 'External')
			return <i>{Effect.Program} {Effect.Args && Effect.Args.join(' ')}</i>
	}
}
