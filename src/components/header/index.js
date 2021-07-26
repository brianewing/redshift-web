import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import style from './style'

import {
	FaBars, FaChainBroken, FaPaintBrush, FaStar, FaQuestionCircleO, FaPowerOff
} from 'react-icons/fa';

import {
	GoTerminal, GoScreenFull
} from 'react-icons/go';

export default class Header extends Component {
	render({ pageTitle, disconnected, hide, onTitleClick, onPowerToggle }) {
		const icon = disconnected ? <FaChainBroken /> : <FaBars />
		return <div>
			{/* { <header class={style.header + ' ' + (hide ? style.hidden : '') + (disconnected ? style.disconnected : '')}> */}
			{ <header class={style.header + ' ' + (hide ? style.hidden : '')}>
				<h1 onMouseDown={onTitleClick}>
					{icon}

					{ disconnected && false
						? 'Disconnected'
						: pageTitle || ' Home' }
				</h1>

				{this.props.children}

				<nav>
					<Link activeClassName={style.active} href="/repl"><GoTerminal /></Link>
					<Link activeClassName={style.active} href="/"><GoScreenFull /><span>Cinema</span></Link>
					<Link activeClassName={style.active} href="/effects"><FaStar /><span>Effects</span></Link>
					<Link activeClassName={style.active} href="/scripts"><FaPaintBrush /><span>Scripts</span></Link>
					<Link activeClassName={style.active} href="/about"><FaQuestionCircleO /><span>Help</span></Link>
					<Link activeClassName={style.active} href="javascript:;" class={style.offButton} onClick={onPowerToggle}><FaPowerOff /></Link>
				</nav>
			</header> }
		</div>
	}
}
