import { h, Component } from 'preact';
import style from './style';

import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/python';

import 'brace/keybinding/vim';

import 'brace/theme/ambiance';
import 'brace/theme/merbivore';
import 'brace/theme/terminal';
import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/vibrant_ink';

import GoArrowLeft from 'react-icons/go/arrow-left';

let THEMES = ['ambiance', 'merbivore', 'terminal', 'vibrant_ink', 'tomorrow_night_bright']

export default class Editor extends Component {
	static defaultProps = {
		mode: 'javascript',
		theme: 'merbivore',
		keyboardHandler: 'vim',
	}

	aceCommands() {
		let { onSave } = this.props, commands = []
		onSave && commands.push({
			name: 'save',
			bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
			exec: () => { onSave(this.state.newContent) }
		})
		return commands
	}

	handleChange = (newText) => {
		this.setState({newContent: newText})
		this.props.onChange && this.props.onChange(newText)
	}

	shouldComponentUpdate() {
		return false;
	}

	render({ filename, content, mode, theme, keyboardHandler, onLeave }) {
		return (
			<div class={style.editor}>
				<h3 style="line-height: 0.3em">
					{onLeave && <a href="javascript:;" style="color:white !important" onClick={onLeave}><GoArrowLeft /></a>}
					<strong>Editing {filename}</strong>
				</h3>
				<AceEditor
					width="100%"
					height="100%"
					mode={mode}
					theme={theme}
					keyboardHandler={keyboardHandler}
					showPrintMargin={false}
					wrapEnabled={true}
					fontSize="1em"
					commands={this.aceCommands()}
					defaultValue={content || SAMPLE_SCRIPTS[mode] || ''}
					onChange={this.handleChange}
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
	frame[0] = [255, 0, 0]; // set first pixel to red
});`,

	python: `#!/usr/bin/env python

from redshift import run

def animation(frame):
	frame[0] = (255, 0, 0) # set first pixel to red

run(animation)`
}
