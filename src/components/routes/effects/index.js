import { h, Component } from 'preact';
import { route } from 'preact-router';

import EffectSetEditor from './effect-set-editor';

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
		// this.oscSummaryInterval = setInterval(this.requestOscSummary, 50)
		this.componentWillReceiveProps(this.props)
	}

	componentWillUnmount() {
		clearInterval(this.oscSummaryInterval)
	}

	componentWillReceiveProps(newProps) {
		// console.log('receiveProps', this.props, newProps)
		if(this.props.stream) {
			this.props.stream.setEffectsFps(0)
			this.props.stream.off('effects', this.receiveEffects)
		}
		if(newProps.stream) {
			newProps.stream.setEffectsFps(EFFECTS_FPS)
			newProps.stream.on('effects', this.receiveEffects)
		}
	}

	receiveEffects = (effects) => {
		this.setState({ effects: effects || [] })
	}

	requestOscSummary = () => {
		const { connection } = this.props
		if(connection)
			connection.requestOscSummary().then((oscSummary) => this.setState({ oscSummary }))
	}

	send = (effects) => {
		this.props.stream.setEffects(effects)
	}

	render({ availableEffects, stream, active }, { effects, selection }) {
		return <div class={style.effects}>
			<EffectSetEditor effects={effects} availableEffects={availableEffects} stream={stream} onChange={this.send} />
			{/* {this.renderOscSummary()} */}
		</div>
	}

	renderOscSummary() {
		const { oscSummary } = this.state
		return <div class={style.oscSummary}>
			<ul>
				{Object.values(oscSummary).map((oscMsg) => <li>
					<strong>{oscMsg.Address}</strong>
					<pre>{JSON.stringify(oscMsg.Arguments)}</pre>
				</li>)}
			</ul>
		</div>
	}
}
