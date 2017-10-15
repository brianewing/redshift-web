import { h, Component } from 'preact';
import style from './style';

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

	chooseFile = (f) => {
		this.props.onChoose && this.props.onChoose(f)
	}

	render({}, { files }) {
		return <div class={style.fileChooser}>
			<h1>File Chooser..</h1>
			{files ? this.renderFileList(files) : <i>Nothing to show</i>}
		</div>
	}

	renderFileList(files) {
		return	<ul>
			{files.map((f) => <li onClick={this.chooseFile.bind(this, f)}>
				{f.name}
			</li>)}
		</ul>
	}
}