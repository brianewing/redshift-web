import { h, Component } from 'preact';

import AceEditor from 'react-ace';
import basicContext from 'basiccontext';

import 'react-ace/node_modules/brace/mode/javascript';
import 'react-ace/node_modules/brace/mode/python';

import 'react-ace/node_modules/brace/keybinding/vim';
import 'react-ace/node_modules/brace/keybinding/emacs';

import 'react-ace/node_modules/brace/theme/ambiance';
import 'react-ace/node_modules/brace/theme/merbivore';
import 'react-ace/node_modules/brace/theme/terminal';
import 'react-ace/node_modules/brace/theme/monokai';
import 'react-ace/node_modules/brace/theme/tomorrow_night_bright';
import 'react-ace/node_modules/brace/theme/vibrant_ink';

import style from './style';

// import GoArrowLeft from 'react-icons/go/arrow-left';
import MdArrowBack from 'react-icons/md/arrow-back';

let THEMES = ['ambiance', 'merbivore', 'terminal', 'vibrant_ink', 'tomorrow_night_bright']

export default class Editor extends Component {
	static defaultProps = {
		mode: 'javascript',
		theme: 'terminal',
	}

	state = {
		fontSize: 0.9,
	}

	componentWillMount() {
		if(!this.props.content) {
			/* When a new file is opened (contents is blank), fill it with a sample script
			 *
			 * This achieves two things - it allows the user to get started quickly, and
			 * also creates the file on the server, as the file chooser currently doesn't do this
			 * when using the "New File" option */
			const mode = this.props.mode
			this.handleChange(SAMPLE_SCRIPTS[mode]) 
		}
	}

	shouldComponentUpdate() {
		/* AceEditor can't handle prop changes, it resets the Ace instance
		 * So instead we render once, then update using the Ace API */
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

	showMenu = (e) => {
		const { editor } = this.aceComponent

		const changeFontSize = (delta) => {
			let { fontSize } = this.state
			fontSize += delta
			this.setState({ fontSize })
			this.aceComponent.editor.setFontSize(`${fontSize}em`)
		}

		const setKeyboardHandler = (mode) => {
			this.aceComponent.editor.setKeyboardHandler(mode ? `ace/keyboard/${mode}` : null)
		}

		const toggleLineWrapping = () => {
			const session = this.aceComponent.editor.getSession()
			session.setUseWrapMode(!session.getUseWrapMode())
		}

		basicContext.show([
			{title: 'Font size ++', fn: () => { changeFontSize(+0.1) }},
			{title: 'Font size --', fn: () => { changeFontSize(-0.1) }},
			{},
			{title: 'Normal mode', fn: () => { setKeyboardHandler(null) }},
			{title: 'Vim mode',    fn: () => { setKeyboardHandler('vim') }},
			{title: 'Emacs mode',  fn: () => { setKeyboardHandler('emacs') }},
			{},
			{title: 'Toggle line wrap', fn: () => { toggleLineWrapping() }},
			{},
			{title: 'Saved automatically', disabled: true},
		], e)
	}

	setAceComponent = (component) => {
		this.aceComponent = component;
	}

	save = () => {
		const { onSave } = this.props
		onSave && onSave(this.state.newContent)
	}

	handleChange = (newText) => {
		this.setState({ newContent: newText })
		this.save()
	}

	render({ filename, content, mode, theme, keyboardHandler, onLeave }, { fontSize }) {
		return <div class={style.editor}>
			<div class={style.editorHeader}>
				{onLeave && <a href="javascript:;" style="color:white !important" onClick={onLeave}><MdArrowBack /></a>}
				Editing {filename}
			</div>
			<div class={style.ace} onContextMenu={this.showMenu}>
				<AceEditor
					ref={this.setAceComponent}
					width="100%"
					height="100%"
					mode={mode}
					theme={theme}
					keyboardHandler={keyboardHandler}
					showPrintMargin={false}
					wrapEnabled={true}
					fontSize="0.9em"
					commands={this.aceCommands()}
					defaultValue={content}
					onChange={this.handleChange}
					editorProps={{$blockScrolling: false, $hasCssTransforms: true}}
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
