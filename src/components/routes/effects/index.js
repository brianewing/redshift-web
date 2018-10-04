import { h, Component } from 'preact';
import { route } from 'preact-router';

import List from './list';
import Detail from './detail';

import style from './style';

const EFFECTS_FPS = 10

/*
 * Receives effects JSON from stream and allows user
 * to add, remove and change effects
 */

// @idea Ctrl+Click to drag effects in list

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

		// this.oscSummaryInterval = setInterval(this.requestOscSummary, 50)
	}

	componentWillUnmount() {
		const { stream } = this.props
		stream.setEffectsFps(0)
		stream.off('effects', this.receiveEffects)

		clearInterval(this.oscSummaryInterval)
	}

	receiveEffects = (effects) => {
		this.setState({ effects: effects || [] })
		return;
		if(this.props.selection == "" && effects && effects.length)
			route('/effects/0')
	}

	requestOscSummary = () => {
		this.props.connection.requestOscSummary().then((summary) => {
			this.setState({ oscSummary: summary })
		})
	}

	send = (effects) => this.props.stream.setEffects(effects)

	selectEffect = (i) => route(`/effects/${i}`)

	updateSelectedEffect = (update) => {
		const effects = this.state.effects || []
		const index = parseInt(this.props.selection, 10)

		this.send([...effects.slice(0, index), update, ...effects.slice(index+1)])
	}

	render({ selection }, { effects }) {
		const chosenEffect = effects && effects[selection]

		return <div class={style.effects}>
			<div class={style.leftPane}>
				{<List items={effects} selection={selection} onSelection={this.selectEffect} onChange={this.send} />}
			</div>

			<div class={style.rightPane}>
				{ chosenEffect
						? <Detail effect={chosenEffect} onChange={this.updateSelectedEffect} />
						: <h2>{/*Choose an effect*/}</h2> }
			</div>
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
