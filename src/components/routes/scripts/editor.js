import { h, Component } from 'preact';

import AceEditor from 'react-ace';
import basicContext from 'basiccontext';

import 'brace/mode/javascript';
import 'brace/mode/python';

import 'brace/keybinding/vim';
import 'brace/keybinding/emacs';

import 'brace/theme/ambiance';
import 'brace/theme/merbivore';
import 'brace/theme/terminal';
import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/vibrant_ink';

import style from './style';

import GoArrowLeft from 'react-icons/go/arrow-left';

let THEMES = ['ambiance', 'merbivore', 'terminal', 'vibrant_ink', 'tomorrow_night_bright']

export default class Editor extends Component {
	static defaultProps = {
		mode: 'javascript',
		theme: 'merbivore',
	}

	state = {
		fontSize: 1.2,
	}

	componentWillMount() {
		if(!this.props.content) {
			const mode = this.props.mode
			this.props.content = SAMPLE_SCRIPTS[mode]
			this.save() // CREATES NEW FILES, TODO: REFACTOR INTO FILE CHOOSER
		}
	}

	shouldComponentUpdate() {
		return false; // AceEditor can't handle prop changes, resets instance
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

	save = () => {
		const { onSave } = this.props
		onSave && onSave(this.state.newContent)
	}

	handleChange = (newText) => {
		this.setState({ newContent: newText })

		if(this.props.onChange)
			this.props.onChange(newText)
	}

	setAceComponent = (component) => {
		this.aceComponent = component;
	}

	render({ filename, content, mode, theme, keyboardHandler, onLeave }, { fontSize }) {
		return <div class={style.editor}>
			<div class={style.editorHeader}>
				{onLeave && <a href="javascript:;" style="color:white !important" onClick={onLeave}><GoArrowLeft /></a>}
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
					wrapEnabled={false}
					fontSize="1.2em"
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
