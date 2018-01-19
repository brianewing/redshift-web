import { h, Component } from 'preact';
import linkState from 'linkstate';

import Modal from '../../modal';

export default class NewFileDialog extends Component {
	state = { filename: "" }

	componentDidMount() {
		this.inputEl.focus()
	}

	setInput = (el) => this.inputEl = el

	render({ onClose, onSubmit }, { filename }) {
		return <Modal onClose={onClose}>
			<div style="text-align: center">
				<h3 style="margin:0">Create New File</h3>

				<form onSubmit={() => onSubmit(filename)} style="margin-top: 1em">
					<input ref={this.setInput}
						onInput={linkState(this, 'filename')}
						placeholder="new-effect.js" />
				</form>
			</div>
		</Modal>
	}
}
