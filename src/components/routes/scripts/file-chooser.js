import { h, Component } from 'preact';
import * as basicModal from 'basicmodal';

import style from './style';

import GoPlus from 'react-icons/go/plus';

export default class FileChooser extends Component {
	state = {
		currentPath: '/',
		files: null
	}

	componentWillMount() {
		this.fetchFiles()
	}

	fetchFiles = () => {
		const { webDavFs } = this.props
		const { currentPath } = this.state
		this.setState({ files: null })
		webDavFs.dir(currentPath).children((files) => {
			if(String.prototype.localeCompare) {
				files.sort((a, b) => a.name.localeCompare(b.name))
			}
			this.setState({ files })
		})
	}

	openNewFileDialog = () => {
		basicModal.show({
			body: `<p><strong>Choose a filename</strong></p>
			<input class='basicModal__text' name='filename' placeholder='new-script.js' />
			`,
			closable: true,
			buttons: {
				cancel: {
					class: basicModal.THEME.xclose,
					title: 'Cancel',
					fn: basicModal.close
				},
				action: {
					title: "Create File",
					fn: ({filename}) => {
						if(filename.trim()) {
							this.createFile(filename)
						}
						basicModal.close()
					}
				}
			}
		})
	}

	createFile = (name) => {
		const { webDavFs } = this.props
		const { currentPath } = this.state
		let newFile = webDavFs.file(currentPath + name)
		this.chooseFile(newFile)
	}

	chooseFile = (f) => {
		this.props.onChoose && this.props.onChoose(f)
	}

	render({}, { files }) {
		return <div class={style.fileChooser}>
			<h2>Choose a File.. <GoPlus onClick={this.openNewFileDialog} /></h2>
			{files == null ? <i>Fetching...</i> : this.renderFileList(files)}
		</div>
	}

	renderFileList(files) {
		return (files.length == 0
			? <i>Nothing to show</i>
			: <ul>{files.map((f) => <li onClick={() => this.chooseFile(f)}>{f.name}</li>)}</ul>)
	}
}
