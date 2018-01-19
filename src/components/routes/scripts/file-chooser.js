import { h, Component } from 'preact';

import basicContext from 'basiccontext';

import NewFileDialog from './new-file-dialog';

import style from './style';

import GoPlus from 'react-icons/go/plus';

export default class FileChooser extends Component {
	state = {
		currentPath: '/',
		files: null,
		newFileDialogOpen: false,
	}

	componentWillMount() {
		this.fetchFiles()
	}

	chooseFile = (f) => this.props.onChoose && this.props.onChoose(f)

	openNewFileDialog = () => this.setState({ newFileDialogOpen: true })
	closeNewFileDialog = () => this.setState({ newFileDialogOpen: false })

	onNewFileDialogSubmit = (name) => {
		this.closeNewFileDialog()
		this.createFile(name)
	}

	showMenu = (e, file) => {
		if(file) {
			basicContext.show([
				{title: 'Edit File', fn: () => this.chooseFile(file)},
				{title: 'Delete File', fn: () => {
					file.rm(() => this.fetchFiles())
				}},
			], e)
		}
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

	createFile = (name) => {
		if(name) {
			const { webDavFs } = this.props
			const { currentPath } = this.state
			const newFile = webDavFs.file(currentPath + name)

			this.chooseFile(newFile)
		}
	}

	render({}, { newFileDialogOpen, files }) {
		return <div class={style.fileChooser}>
			<h2>Choose a File.. <GoPlus onClick={this.openNewFileDialog} /></h2>

			{newFileDialogOpen ? <NewFileDialog onClose={this.closeNewFileDialog}
				onSubmit={this.onNewFileDialogSubmit} /> : null}

			{files == null ? <i>Fetching...</i> : this.renderFileList(files)}
		</div>
	}

	renderFileList(files) {
		return (files.length == 0
			? <i>Nothing to show</i>
			: <ul>
				{files.map((f) => <li onClick={() => this.chooseFile(f)} onContextMenu={(e) => this.showMenu(e, f)}>
						{f.name}
					</li>)}
				</ul>)
	}
}
