import { h, Component } from 'preact';

import style from './style';

export default class Repl extends Component {
    render() {
        return <div class={style.repl}>
            <h1>Repl</h1>
        </div>
    }
}