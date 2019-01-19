import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import style from './style'

import FaBars from 'react-icons/lib/fa/bars';
import FaChainBroken from 'react-icons/lib/fa/chain-broken';

import FaPaintBrush from 'react-icons/lib/fa/paint-brush';

import GoPaintcan from 'react-icons/lib/go/paintcan';
import GoTerminal from 'react-icons/lib/go/terminal';
import GoPlug from 'react-icons/lib/go/plug';
import GoScreenFull from 'react-icons/lib/go/screen-full';

import FaAdjust from 'react-icons/lib/fa/adjust';
import FaDesktop from 'react-icons/lib/fa/desktop';
import FaStar from 'react-icons/lib/fa/star';
import FaListUl from 'react-icons/lib/fa/list-ul';
import FaArrowsAlt from 'react-icons/lib/fa/arrows-alt';
import FaQuestionCircleO from 'react-icons/lib/fa/question-circle-o';

import FaPowerOff from 'react-icons/lib/fa/power-off'

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
						: pageTitle || 'Redshift' }
				</h1>

				{this.props.children}

				<nav>
					<Link activeClassName={style.active} href="/"><GoScreenFull /><span>Cinema</span></Link>
					<Link activeClassName={style.active} href="/effects"><FaStar /><span>Effects</span></Link>
					<Link activeClassName={style.active} href="/scripts"><FaPaintBrush /><span>Scripts</span></Link>
					<Link activeClassName={style.active} href="/repl"><GoTerminal /><span>Console</span></Link>
					<Link activeClassName={style.active} href="/about"><FaQuestionCircleO /><span>Help</span></Link>
					<Link activeClassName={style.active} href="javascript:;" class={style.offButton} onClick={onPowerToggle}><FaPowerOff /></Link>
				</nav>
			</header> }
		</div>
	}
}
