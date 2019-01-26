import { h, Component } from 'preact';
import Collapse from 'rc-collapse';

import style from './style';

const SUMMARY_FPS = 6

export default class OscSummary extends Component {
    state = {
        summary: {},
    }

    interval = null

    componentWillMount() {
        // this.interval = setInterval(this.request, 1000 / SUMMARY_FPS)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    request = () => {
        const { connection } = this.props
        if(connection)
            connection.requestOscSummary().then((summary) => this.setState({ summary }))
    }

    clear = () => {
        const { connection } = this.props
        if(connection) {
            connection.clearOscSummary()
            this.request()
        }
    }

    render({}, { summary }) {
        const numAddresses = Object.keys(summary).length

        if(!numAddresses)
            return <div></div>

		return <div class={style.oscSummary}>
            <Collapse accordion={true}>
                <Collapse.Panel header={'OSC Summary' + (numAddresses ? ` (${numAddresses} Addresses)` : '')}>
                    <button onClick={this.clear}>Clear</button>
                    <ul>
                        {Object.values(summary).map((oscMsg) => <li>
                            <strong>{oscMsg.Address}</strong>
                            <pre>{JSON.stringify(oscMsg.Arguments)}</pre>
                        </li>)}
                    </ul>
                </Collapse.Panel>
            </Collapse>
		</div>
    }
}