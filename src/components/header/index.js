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
			{ !hide && <header class={style.header + ' ' + (disconnected ? style.disconnected : '')}>
				<h1 onMouseDown={onTitleClick}>
					{icon}

					{ disconnected
						? 'Disconnected'
						: pageTitle || 'Redshift' }
				</h1>

				{this.props.children}

				<nav>
					<Link activeClassName={style.active} href="/"><GoScreenFull /></Link>
					<Link activeClassName={style.active} href="/effects"><FaStar /></Link>
					<Link activeClassName={style.active} href="/scripts"><FaPaintBrush /></Link>
					<Link activeClassName={style.active} href="/repl"><GoTerminal /></Link>
					<Link activeClassName={style.active} href="javascript:;" onClick={onPowerToggle}><FaPowerOff /></Link>
					<Link activeClassName={style.active} href="/about"><FaQuestionCircleO /></Link>
				</nav>
			</header> }
		</div>
	}
}
