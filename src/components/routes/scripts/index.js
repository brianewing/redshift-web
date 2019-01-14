import { h, Component } from 'preact';
import { route } from 'preact-router';

import basicContext from 'basiccontext';
import WebDAV from '../../../lib/webdav';

import Editor from './editor';
import FileChooser from './file-chooser';

import style from './style';

export default class Scripts extends Component {
	state = {
		webDavFs: null,
		panes: []
	}

	componentWillMount() {
		let webDavFs = new WebDAV.Fs(this.props.serverUrl)
		this.setState({ webDavFs })
		this.newPane()
	}

	_nextPaneId = 1

	newPane = () => {
		let panes = this.state.panes.concat([this._nextPaneId++])
		this.setState({ panes })
	}

	closePane = (id) => {
		let panes = this.state.panes.concat([])
		panes.splice(panes.indexOf(id), 1)

		if(panes.length == 0)
			route('/')
		else
			this.setState({ panes })
	}

	showMenu = (paneId, e) => {
		basicContext.show([
			{title: 'New Pane', fn: () => this.newPane()},
			{title: 'Close This', fn: () => this.closePane(paneId)},
		], e)
	}

	render({}, { webDavFs, panes }) {
		return <div class={style.panes}>
			{panes.map((id) => <div key={id} class={style.pane} onContextMenu={this.showMenu.bind(this, id)}>
				<Pane webDavFs={webDavFs} />
			</div>)}
		</div>
	}
}

class Pane extends Component {
	state = {
		currentFile: null
	}

	loadFile = ({ name, url }) => {
		this.props.webDavFs.file(url).read((contents) => {
			this.setState({ currentFile: { name, url, contents }})
		})
	}

	writeFile = ({ url, contents }) => {
		console.log("Write", url)
		this.props.webDavFs.file(url).write(contents, (resp) => {
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

	render({ webDavFs }, { currentFile }) {
		if(currentFile) {
			let { name, url, contents } = currentFile
			let save = (contents) => this.writeFile({ url, contents })
			return <Editor
				filename={name}
				content={contents}
				mode={this.getLanguageFromFilename(name)}
				onSave={save}
				onLeave={this.returnToFileList} />
		} else {
			return <FileChooser webDavFs={webDavFs} onChoose={this.loadFile} />
		}
	}
}