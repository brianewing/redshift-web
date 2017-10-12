import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import LEDStrip from '../../components/led-strip'

import style from './style'

import GoPaintcan from 'react-icons/lib/go/paintcan';
import GoTerminal from 'react-icons/lib/go/terminal';
import GoPlug from 'react-icons/lib/go/plug';
import GoScreenFull from 'react-icons/lib/go/screen-full';

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
						<Link activeClassName={style.active} href="/"><GoScreenFull /></Link>
						<Link activeClassName={style.active} href="/effects"><GoPlug /></Link>
						<Link activeClassName={style.active} href="/scripts"><GoPaintcan /></Link>
						{false && <Link activeClassName={style.active} href="/repl"><GoTerminal /></Link>}
						<Link activeClassName={style.active} href="javascript:;" onClick={toggleOff}><FaPowerOff /></Link>
					</nav>
				</header>
			</div>
		);
	}
}
