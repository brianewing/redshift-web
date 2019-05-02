import { h, Component } from 'preact';

import { debounce, bind } from 'decko';
import WebDAV from '../../../lib/webdav';

import Editor from './editor';
import FileChooser from './file-chooser';

import style from './style';

export default class Scripts extends Component {
	state = {
		webDavFs: null,

		currentFile: {
			contents: null,
			name: null,
			url: null,
		}
	}

	componentWillMount() {
		const webDavFs = new WebDAV.Fs(this.props.serverUrl)
		this.setState({ webDavFs })
	}

	loadFile = (opts) => {
		this.state.webDavFs.file(opts.url).read((content) => {
			this.setState({
				currentFile: { name: opts.name, url: opts.url, content: content }
			})
		})
	}

	@bind
	@debounce(250)
	writeFile({ url, content }) {
		this.state.webDavFs.file(url).write(content, () => null)
	}

	returnToFileList = () => {
		this.setState({ currentFile: null })
	}

	render({}, { webDavFs, currentFile={} }) {
		const save = (content) => this.writeFile({ url: currentFile.url, content })

		return <div class={style.scripts}>
			<FileChooser webDavFs={webDavFs} currentFileUrl={currentFile.url} onChoose={this.loadFile} />

			{ currentFile.url && <Editor
				key={currentFile.url} /* destroy and replace editor instance when url changes */
				fileName={currentFile.name}
				content={currentFile.content}
				onSave={save} onLeave={this.returnToFileList} /> }
		</div>
	}
}
