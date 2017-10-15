import { h, Component } from 'preact';
import style from './style';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/python';
import 'brace/keybinding/vim';
import { StatusBar } from 'brace/ext/statusbar';

import 'brace/theme/ambiance';
import 'brace/theme/merbivore';
import 'brace/theme/terminal';
import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/twilight';
import 'brace/theme/vibrant_ink';

let THEMES = ['ambiance', 'merbivore', 'terminal', 'vibrant_ink', 'tomorrow_night_bright']

export default class Editor extends Component {
	defaultProps = {
		mode: 'javascript',
		theme: 'terminal',
		keyboardHandler: 'vim',
	}

	sendScript = () => {
		let { onWrite } = this.props
		onWrite && onWrite(this.state.script)
	}

    shouldComponentUpdate() {
		return false;
    }

	render({ mode, theme, keyboardHandler }) {
		return (
			<div class={style.editor}>
				<AceEditor
					width="100%"
					height="100%"
				    mode={mode}
				    theme={theme}
				    keyboardHandler={keyboardHandler}
				    showPrintMargin={false}
				    fontSize="17px"
				    defaultValue={SAMPLE_SCRIPTS[mode] || ''}
				    onChange={(newText) => this.setState({script: newText})}
				    editorProps={{$blockScrolling: false}}
				  />
			</div>
		)
	}
}

const SAMPLE_SCRIPTS = {
	javascript: `#!/usr/bin/env node

let redshift = require('./redshift');

redshift((frame) => {
	for(let i=0; i<frame.length; i++) {
		frame[i][0] = Math.max(0, frame[i][2] - frame[i][0]);
	}
});`,

	python: `#!/usr/bin/env python

from redshift import run

def animation(frame):
	frame[0] = (255, 0, 0)

run(animation)`
}