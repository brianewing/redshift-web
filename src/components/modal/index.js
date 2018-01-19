import { h, Component } from 'preact';
import Portal from 'preact-portal';

import style from './style';

export default class Modal extends Component {
	componentDidMount() {
		window.addEventListener('keydown', this.escKeyListener)
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.escKeyListener)
	}

	escKeyListener = ({ key }) => {
		if(key == 'Escape')
			this.close()
	}

	close = () => {
		if(this.props.onClose)
			this.props.onClose()
	}

	render({ children }) {
		return <Portal into="body">
			<div>
				<div class={style.modalBg} onClick={this.close}></div>

				<div class={style.modalBody}>
					{children}
				</div>
			</div>
		</Portal>
	}
}
