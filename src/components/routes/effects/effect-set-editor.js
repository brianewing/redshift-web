import { h, Component } from 'preact';

import List from './list';
import Detail from './detail';

import style from './style';

export default class EffectSetEditor extends Component {
	state = {
		selection: null,
	}

	send = (effects) => {
		this.props.onChange(effects)
	}

	selectEffect = (selection) => {
		this.setState({ selection })
	}

	updateSelectedEffect = (update) => {
		const effects = this.props.effects || []
		const index = this.state.selection

		this.send([...effects.slice(0, index), update, ...effects.slice(index+1)])
	}

	render({ availableEffects, stream, effects }, { selection }) {
		const chosenEffect = effects && effects[selection]

		return <div class={style.effectSet} data-effect-selected={chosenEffect != null}>
			<div class={style.masterView}>
				{ <List items={effects}
						stream={stream}
						availableEffects={availableEffects}
						selection={selection}
						onSelection={this.selectEffect}
						onChange={this.send} /> }
			</div>

			<div class={style.detailView}>
				{ chosenEffect
					? <Detail effect={chosenEffect}
										availableEffects={availableEffects}
										onChange={this.updateSelectedEffect}
										onBackButton={() => this.selectEffect(null)} />
					: <h2>{/*Choose an effect*/}</h2> }
			</div>
		</div>
	}
}
