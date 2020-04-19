import { Component } from 'preact';

import { Router, Link, route } from 'preact-router';

import Config from '../../../config';

import timeSince from './lib/time-since';

import Licenses from './licenses';
import style from './style';

const pages = {
	"docs":     Docs,
	"licenses": Licenses,
	"help":     () => <div />,
}

export default function About({ page, serverWelcome }) {
	const Page = pages[page] || Index

	return <div class={style.about}>
		<Page serverWelcome={serverWelcome} />
	</div>
}

function Docs() {
	return <div class={style.about}>
		<iframe src="http://localhost:3000" frameBorder={0} style="width:100%;height:100%;" />
	</div>
}

function Index({ serverWelcome }) {
	return <div class={style.index}>
		<pre>
			{ serverWelcome.config.serverName && <div style="margin-bottom:0.5em"><strong>{serverWelcome.config.serverName}</strong></div> }
			<table style="margin: 0 auto">
				<tr>
					<td>Server</td>
					<td>{ Config.host }</td>
				</tr>

				<tr>
					<td>Version</td>
					<td>{ serverWelcome.version }</td>
				</tr>

				<tr>
					<td>Uptime</td>
					<td><UptimeClock time={serverWelcome.started} /></td>
				</tr>
			</table>
		</pre>

		<ul>
			<li onClick={ () => route('/about/docs') }>
				Open Documentation
			</li>

			<li onClick={ () => route('/about/licenses') }>
				Software Licenses
			</li>

			<li onClick={ () => window.open('https://github.com/brianewing/redshift') }>
				Redshift Source Code
			</li>

			<li onClick={ () => route('/about/server') }>
				Server Information
			</li>
		</ul>
	</div>
}

class UptimeClock extends Component {
	componentDidMount() {
		this.interval = setInterval(() => this.forceUpdate(), 1000)
	}

	componentWillUnmount() {
		clearInterval(this.interval)
	}

	render({ time }) {
		return <span>{ timeSince(time) }</span>
	}
}
