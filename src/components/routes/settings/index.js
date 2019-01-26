import { h, Component } from 'preact';

import Config from '../../../config';

import style from './style';

export default class Settings extends Component {
    render() {
        return <div class={style.settings}>
            <p><i>Refresh to make settings take effect</i></p>

            <h2>Server</h2>

            <input value={Config.host} onInput={e => Config.host = e.target.value} />

            <h2>Frame Rate</h2>
            <input type="number" value={Config.bufferFps} onInput={e => Config.bufferFps = e.currentTarget.value} />

            <h2>Autohide Header</h2>
            <ToggleButton configKey="autoHideHeader" />
        </div>
    }
}

class ToggleButton extends Component {
    state = {
        on: false,
    }

    componentWillReceiveProps(newProps, b) {
        console.log(JSON.stringify(newProps), JSON.stringify(b))
        Config.on(newProps.configKey, this.updateOn)
        this.updateOn()
    }

    componentWillUnmount() {
        Config.off(this.props.configKey, this.updateOn)
    }

    updateOn = () => {
        this.setState({ on: Config[this.props.configKey] })
    }

    toggle = () => {
        Config[this.props.configKey] = !Config[this.props.configKey]
    }

    render({}, { on }) {
        return <button onClick={this.toggle}>{ on ? "Yes" : "No" }</button>
    }
}