import { h, Component } from 'preact';
import { route } from 'preact-router';

import basicContext from 'basiccontext';
import WebDAV from '../../../lib/webdav';

import Editor from './editor';
import FileChooser from './file-chooser';

export default class Scripts extends Component {
	state = {
		currentFile: null,
		panes: []
	}

	componentWillMount() {
		let webDavFs = new WebDAV.Fs(this.props.serverUrl)
		this.setState({ webDavFs: webDavFs })
	}

	showMenu = (e) => {
		let noop = () => {}
		let close = () => {
			if(this.state.panes.length == 0)
				route('/')
		}
		basicContext.show([
			{title: 'New Pane', fn: noop},
			{title: 'Close This', fn: close},
		], e)
	}

	loadFile = ({ name, url }) => {
		this.state.webDavFs.file(url).read((contents) => {
			this.setState({ currentFile: { name, url, contents }})
		})
	}

	writeFile = ({ url, contents }) => {
		console.log("Write", url)
		this.state.webDavFs.file(url).write(contents, (resp) => {
			console.log("Written")
		})
	}

	getLanguageFromFilename = (filename) => {
		let parts = filename.split('.')
		let ext = parts[parts.length-1]
		switch(ext) {
			case 'js': return 'javascript';
			case 'py': return 'python';
			case 'coffee': return 'coffee';
		}
	}

	returnToFileList = () => {
		this.setState({ currentFile: null })
	}

	render(props, state) {
		return <div onContextMenu={this.showMenu}>
			{this.renderMode(props, state)}
		</div>
	}

	renderMode({}, { webDavFs, currentFile }) {
		if(currentFile) {
			let { name, url, contents } = currentFile
			let onSave = (newContent) => this.writeFile({ url, contents: newContent })
			return <Editor
				filename={name}
				content={contents}
				mode={this.getLanguageFromFilename(name)}
				onSave={onSave}
				onChange={onSave}
				onLeave={this.returnToFileList} />
		} else {
			return <FileChooser webDavFs={webDavFs} onChoose={this.loadFile} />
		}
	}
}