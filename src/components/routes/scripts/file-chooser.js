import { h, Component } from 'preact';
import style from './style';

import WebDAV from '../../../lib/webdav';

export default class FileChooser extends Component {
	state = {
		currentPath: '/'
	}

	componentWillMount() {
		let fs = new WebDAV.Fs(this.props.serverUrl)
		this.setState({ fs })
		this.fetchFiles()
	}

	fetchFiles = () => {
		let { currentPath, fs } = this.state
		fs.dir(currentPath).children((files) => {
			this.setState({ files })
		})
	}

	render({}, { files }) {
		return <div class={style.fileChooser}>
			<h1>File Chooser..</h1>
			{JSON.stringify(files)}
		</div>
	}
}