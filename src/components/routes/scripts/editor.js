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

	componentWillMount() {
		if(!this.props.content) {
			const mode = this.props.mode
			this.props.content = SAMPLE_SCRIPTS[mode]
			this.save() // CREATES NEW FILES, TODO: REFACTOR INTO FILE CHOOSER
		}
	}

	shouldComponentUpdate() {
		return false;
	}

	aceCommands() {
		return [
			{
				name: 'save',
				bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
				exec: this.save,
			},
		]
	}

	save = () => {
		const { onSave } = this.props
		onSave && onSave(this.state.newContent)
	}

	handleChange = (newText) => {
		this.setState({ newContent: newText })

		if(this.props.onChange)
			this.props.onChange(newText)
	}

	render({ filename, content, mode, theme, keyboardHandler, onLeave }) {
		return <div class={style.editor}>
			<div class={style.editorHeader}>
				{onLeave && <a href="javascript:;" style="color:white !important" onClick={onLeave}><GoArrowLeft /></a>}
				Editing {filename}
			</div>
			<div class={style.ace}>
				<AceEditor
					width="100%"
					height="100%"
					mode={mode}
					theme={theme}
					keyboardHandler={keyboardHandler}
					showPrintMargin={false}
					wrapEnabled={false}
					fontSize="1em"
					commands={this.aceCommands()}
					defaultValue={content}
					onChange={this.handleChange}
					editorProps={{$blockScrolling: false}}
				  />
			</div>
		</div>
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
