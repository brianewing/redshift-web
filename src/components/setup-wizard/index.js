import { h, Component } from 'preact'

import LEDStrip from '../led-strip'

import Config from '../../config'

import animation from './animation'
import style from './style'

export default class SetupWizard extends Component {
	componentWillMount() {
		this.animationStream = animation()
	}

	componentWillUnmount() {
		this.animationStream.stop()
	}

	render() {
		return <div class={style.setupWizard}>
			<LEDStrip stream={this.animationStream} />

			<h1>Hi, I am the setup wizard</h1>

			<button>Hey, setup wizard. Set me up &rarr;</button>
		</div>
	}
}

class Passthrough extends Component {
	render({ children }) {
		if(Config.setupIsComplete)
			return <div id="app">{ children }</div>
		else
			return <SetupWizard />
	}
}

SetupWizard.Passthrough = Passthrough
