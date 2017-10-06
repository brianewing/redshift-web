import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import LEDStrip from '../../components/led-strip'

import style from './style'

import FaGamepad from 'react-icons/lib/fa/gamepad'
import FaCubes from 'react-icons/lib/fa/cubes'
import FaStar from 'react-icons/lib/fa/star'
import FaPowerOff from 'react-icons/lib/fa/power-off'

export default class Header extends Component {
	render({ buffer, toggleOff, off }) {
		return (
			<div>
				<LEDStrip buffer={buffer} paused={off} class={style.headerStrip} reverse={true} />
				<header class={style.header}>
					<h1 onClick={() => window.location = location}>Redshift</h1>
					{this.props.children}
					<nav>
						<Link activeClassName={style.active} href="/"><FaGamepad /></Link>
						<Link activeClassName={style.active} href="/effects"><FaStar /></Link>
						<Link activeClassName={style.active} href="/repl">Repl</Link>
						<Link activeClassName={style.active} href="/scripts">Scripts</Link>
						<Link activeClassName={style.active} href="javascript:;" onClick={toggleOff}><FaPowerOff /></Link>
					</nav>
				</header>
			</div>
		);
	}
}
