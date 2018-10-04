import { h, Component} from 'preact';
import basicContext from 'basiccontext';

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
			{},
			{title: 'Duplicate', fn: this.duplicate},
			{title: 'Remove', fn: this.remove},
		], e)
	}

	moveUp = () => this.props.onMove(-1)
	moveDown = () => this.props.onMove(1)
	duplicate = () => this.props.onDuplicate()
	remove = () => this.props.onRemove()

	onTypeChange = (newType) => {
		const { onTypeChange } = this.props
		onTypeChange(newType)
	}

	onFieldChange = (field, newValue) => {
		const { onFieldChange, effect } = this.props
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
					{renderIcon(effect)} <strong>{effect.Type}</strong> {this.renderSummary()}
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

	renderValue(value, key) {
		if(key == 'Effects')
			return <EffectSet items={value} />
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
