import { h, Component } from 'preact';

import Effects from '../effects';
import Config from '../../../config';

import style from './style';

export default class Settings extends Component {
    render() {
        return <div class={style.settings}>
            <h2>Server</h2>

            <input value={Config.host} onInput={e => Config.host = e.target.value} />

            <h2>Frame Rate</h2>
            <input type="number" value={Config.bufferFps} onInput={e => Config.bufferFps = e.currentTarget.value} />

            <div style="width: 100%"><Effects stream={app.state.stream} /></div>
        </div>
    }
}