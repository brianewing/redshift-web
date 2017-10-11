import { h, Component } from 'preact';
import style from './style';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/coffee';
import 'brace/mode/python';
import 'brace/keybinding/vim';
import { StatusBar } from 'brace/ext/statusbar';

import 'brace/theme/ambiance';
import 'brace/theme/merbivore';
import 'brace/theme/terminal';
import 'brace/theme/tomorrow_night';
import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/theme/twilight';
import 'brace/theme/vibrant_ink';

let THEMES = ['ambiance', 'merbivore', 'terminal', 'vibrant_ink', 'tomorrow_night', 'tomorrow_night_bright', 'tomorrow_night_eighties']

export default class Scripts extends Component {
	state = {
		// currentTheme: 'terminal'
		currentTheme: 'ambiance'
	}

	sendScript = () => {
		let { onWrite } = this.props
		onWrite && onWrite(this.state.script)
	}

    shouldComponentUpdate() {
		return false;
    }

	render({ effects }, { currentTheme, customJson }) {
		return (
			<div class={style.scripts}>
				<AceEditor
					width="100%"
				    mode="python"
				    theme={currentTheme}
				    keyboardHandler="vim"
				    fontSize="16px"
				    defaultValue={SAMPLE_SCRIPT}
				    onChange={(newText) => this.setState({script: newText})}
				    editorProps={{$blockScrolling: false}}
				  />
			</div>
		)
	}
}

const SAMPLE_SCRIPT = `#!/usr/bin/env node

let redshift = require('./redshift');

redshift((frame) => {
	for(let i=0; i<frame.length; i++) {
		frame[i][0] = Math.max(0, frame[i][2] - frame[i][0]);
	}
});`