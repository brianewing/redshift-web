import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import SimpleCodeEditor from 'react-simple-code-editor';

import 'prismjs';
import 'prismjs/components/prism-python';

import style from './style';

export default class Editor extends Component {
	state = {
		fontSize: 0.70,
		tabSize: 2,
		content: null,
	}

	componentWillMount() {
		this.setState({
			content: this.props.content,
		})

		if(!this.props.content) {
			/* When a new file is opened, fill it with a sample script */
			this.handleChange(sampleScriptFromFileName(this.props.fileName))
		}
	}

	componentDidMount() {
		this.focusTextarea()
		this.moveCursorToStartOfTextarea()
	}

	showMenu = (e) => {
		const changeFontSize = (delta) => {
			this.setState({ fontSize: this.state.fontSize + delta })
		}

		const changeTabSize = (delta) => {
			this.setState({ tabSize: this.state.tabSize + delta })
		}

		const toggleLineWrapping = () => {
			this.setState({ lineWrap: !this.state.lineWrap })
		}

		basicContext.show([
			{title: 'Font size ++', fn: () => { changeFontSize(+0.05) }},
			{title: 'Font size --', fn: () => { changeFontSize(-0.05) }},
			{},
			{title: 'Tab size ++', fn: () => { changeTabSize(+1) }},
			{title: 'Tab size --', fn: () => { changeTabSize(-1) }},
			{},
			{title: 'Toggle line wrap', fn: () => { toggleLineWrapping() }},
			{},
			{title: 'Saved automatically', fn: this.save},
		], e)
	}

	save = () => {
		const { onSave } = this.props
		onSave && onSave(this.state.content)
	}

	handleChange = (newText) => {
		this.setState({ content: newText })
		this.save()
	}

	focusTextarea = () => this.wrapperDiv.querySelector('textarea').focus()

	moveCursorToStartOfTextarea = () => this.wrapperDiv.querySelector('textarea').setSelectionRange(0, 0)
	moveCursorToEndOfTextarea = () => this.wrapperDiv.querySelector('textarea').setSelectionRange(-1, 0)

	render({ fileName }, { content, fontSize, tabSize }) {
		const highlight = (code) => Prism.highlight(code, prismLanguageFromFileName(fileName))

		return <div class={style.editor}
					style={`font-size: ${fontSize}em; height: 100%`}
					ref={el => this.wrapperDiv = el}
					onContextMenu={this.showMenu}
					onClick={this.focusTextarea}>
			<SimpleCodeEditor
				value={content}
				onValueChange={this.handleChange}
				highlight={highlight}
				tabSize={tabSize}
				insertSpaces={true}
				style={{}} />
		</div>
	}
}

function prismLanguageFromFileName(fileName) {
	const components = fileName.split('.')
	const extension = components[components.length-1]
	switch(extension) {
		case 'coffee': return Prism.languages.coffeescript
		case 'js': return Prism.languages.js
		case 'py': return Prism.languages.python
	}
	return Prism.languages.js
}

function sampleScriptFromFileName(fileName) {
	const components = fileName.split('.')
	const extension  = components[components.length-1]
	switch(extension) {
		case 'coffee': return SAMPLE_SCRIPTS.coffeescript
		case 'js': return SAMPLE_SCRIPTS.javascript
		case 'py': return SAMPLE_SCRIPTS.python
	}
	return SAMPLE_SCRIPTS.default
}

const SAMPLE_SCRIPTS = {
	default: `#!/bin/sh

echo "Hello world from your new script file!" > /dev/stderr

# Run cat which will echo pixels from stdin to stdout without changing them
exec cat
`,

	coffeescript: `#!/usr/bin/env coffee

redshift = require './redshift'

console.info "#{require('path').basename __filename} script running"

redshift (frame) ->
	frame[0] = [255, 0, 0]
	frame[frame.length - 1] = [0, 0, 255]
	frame[Math.floor(frame.length / 1)] = [0, 255, 0]
`,

	javascript: `#!/usr/bin/env node

const redshift = require('./redshift');

console.info(\`\${require('path').basename(__filename)} script running\`);

redshift((frame) => {
	frame[0] = [255, 0, 0]; // set first pixel to red
});`,

	python: `#!/usr/bin/env python

from os.path import basename
from redshift import run, log

log('%s script running' % os.path.basename(__file__))

def animation(frame):
	frame[0] = (255, 0, 0) # set first pixel to red

run(animation)`
}
