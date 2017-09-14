import { h, Component } from 'preact'
import { Link } from 'preact-router/match'

import LEDStrip from '../../components/led-strip'

import style from './style'

import FaGamepad from 'react-icons/lib/fa/gamepad'
import FaCubes from 'react-icons/lib/fa/cubes'
import FaStar from 'react-icons/lib/fa/star'
import FaPowerOff from 'react-icons/lib/fa/power-off'

export default class Header extends Component {
	render({ stripBuffer, toggleOff }) {
		return (
			<div>
				<HeaderStrip buffer={stripBuffer || []} />
				<header class={style.header}>
					<h1>Redshift</h1>
					{this.props.children}
					<nav>
						<Link activeClassName={style.active} href="/"><FaGamepad /></Link>
						<Link activeClassName={style.active} href="/modes"><FaStar /></Link>
						<Link activeClassName={style.active} href="javascript:;" onTouchStart={toggleOff} onfowiClick={toggleOff}><FaPowerOff /></Link>
					</nav>
				</header>
			</div>
		);
	}
}

class HeaderStrip extends Component {
	render({ buffer }) {
		buffer = buffer.slice(0).reverse()
		let ledWidth = `${100 / buffer.length}%`
		return <div class={style.headerStrip}>{buffer.map((led) => this.renderLed(led, ledWidth))}</div>
	}

	renderLed(led, width) {
		let color = `rgb(${led.join(',')})`
		return <div class={style.headerLed} style={`width: ${width}; background-color: ${color}`}></div>
	}
}
