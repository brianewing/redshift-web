import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import LEDStrip from '../../components/led-strip'

import style from './style'

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
	render({ hide, onTitleClick, stream, reverseStrip, toggleOff, off }) {
		return <div>
			{ stream && <LEDStrip stream={stream} paused={off} class={style.headerStrip} reverse={reverseStrip} /> }

			{ !hide && <header class={style.header + ' '}>
				<h1 onClick={onTitleClick}>Redshift</h1>
				{this.props.children}
				<nav>
					<Link activeClassName={style.active} href="/about"><FaQuestionCircleO /></Link>
					<Link activeClassName={style.active} href="/"><GoScreenFull /></Link>
					<Link activeClassName={style.active} href="/effects"><GoPlug /></Link>
					<Link activeClassName={style.active} href="/scripts"><FaPaintBrush /></Link>
					{false && <Link activeClassName={style.active} href="/repl"><GoTerminal /></Link>}
					<Link activeClassName={style.active} href="javascript:;" onClick={toggleOff}><FaPowerOff /></Link>
				</nav>
			</header> }
		</div>
	}
}
