import { h, Component } from 'preact';
import style from './style';

import GoPlus from 'react-icons/go/plus';

export default class FileChooser extends Component {
	state = {
		currentPath: '/'
	}

	componentWillMount() {
		this.fetchFiles()
	}

	fetchFiles = () => {
		let { webDavFs } = this.props
		let { currentPath } = this.state
		webDavFs.dir(currentPath).children((files) => {
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
			<h1>Choose a File.. <GoPlus onClick={this.createFile} /></h1>
			{files ? this.renderFileList(files) : <i>Nothing to show</i>}
		</div>
	}

	renderFileList(files) {
		return	<ul>
			{files.map((f) => <li onClick={() => this.chooseFile(f)}>{f.name}</li>)}
		</ul>
	}
}