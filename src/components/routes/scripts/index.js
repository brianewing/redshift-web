import { h, Component } from 'preact';

import Editor from './editor';
import FileChooser from './file-chooser';
import style from './style';

export default class Scripts extends Component {
	state = {
		currentFile: null
	}

	getLanguageFromFilename = (filename) => {
		return 'python'
	}

	render({ serverUrl }, { currentFile }) {
		if(currentFile)
			return <Editor mode={this.getLanguageFromFilename(currentFile)} />
		else
			return <FileChooser serverUrl={serverUrl} />
	}
}