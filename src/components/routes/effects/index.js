import { h, Component } from 'preact';
import { route } from 'preact-router';

import EffectSetEditor from './effect-set-editor';
import OscSummary from './osc-summary';

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
	}

	componentWillMount() {
		this.componentWillReceiveProps(this.props)
	}

	componentWillReceiveProps(newProps) {
		if(this.props.stream) {
			this.props.stream.setEffectsFps(0)
			this.props.stream.off('effects', this.receiveEffects)
		}
		if(newProps.stream) {
			newProps.stream.setEffectsFps(EFFECTS_FPS)
			newProps.stream.on('effects', this.receiveEffects)
		}
	}

	/* send / receive */

	receiveEffects = (effects) =>
		this.setState({ effects: effects || [] })

	receiveOscSummary = (oscSummary) =>
		this.setState({ oscSummary })

	send = (effects) => {
		this.props.stream.setEffects(effects)
	}

	/* render */

	// todo: find better name for availableEffects
	render({ availableEffects, stream, connection }, { effects, oscSummary }) {
		return <div class={style.effects}>
			<EffectSetEditor effects={effects} availableEffects={availableEffects} oscSummary={oscSummary} stream={stream} onChange={this.send} />
			{<OscSummary connection={connection} onReceive={this.receiveOscSummary} />}
		</div>
	}

}
