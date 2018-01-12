import { h, Component } from 'preact';
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
		let { webDavFs } = this.props
		let { currentPath } = this.state
		this.setState({ files: null })
		webDavFs.dir(currentPath).children((files) => {
			if(String.prototype.localeCompare) {
				files.sort((a, b) => a.name.localeCompare(b.name))
			}
			this.setState({ files })
		})
	}

	createFile = () => {
		let { webDavFs } = this.props
		let { currentPath } = this.state
		let name = prompt('Choose a file name')
		let newFile = webDavFs.file(currentPath + name)
		this.chooseFile(newFile)
	}

	chooseFile = (f) => {
		this.props.onChoose && this.props.onChoose(f)
	}

	render({}, { files }) {
		return <div class={style.fileChooser}>
			<h2>Choose a File.. <GoPlus onClick={this.createFile} /></h2>
			{files == null ? <i>Fetching...</i> : this.renderFileList(files)}
		</div>
	}

	renderFileList(files) {
		return (files.length == 0
			? <i>Nothing to show</i>
			: <ul>{files.map((f) => <li onClick={() => this.chooseFile(f)}>{f.name}</li>)}</ul>)
	}
}
