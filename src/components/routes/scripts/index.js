import { h, Component } from 'preact';

import WebDAV from '../../../lib/webdav';

import Editor from './editor';
import FileChooser from './file-chooser';
import style from './style';

export default class Scripts extends Component {
	state = {
		currentFile: null
	}

	componentWillMount() {
		let webDavFs = new WebDAV.Fs(this.props.serverUrl)
		this.setState({ webDavFs: webDavFs })
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

	loadFile = ({ name, url }) => {
		this.state.webDavFs.file(url).read((contents) => {
			this.setState({ currentFile: { name, url, contents }})
		})
	}

	render({}, { webDavFs, currentFile }) {
		if(currentFile) {
			let { name, contents } = currentFile
			return <Editor filename={name} content={contents} mode={this.getLanguageFromFilename(name)} />
		} else {
			return <FileChooser webDavFs={webDavFs} onChoose={this.loadFile} />
		}
	}
}