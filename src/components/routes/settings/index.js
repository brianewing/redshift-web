import { h, Component } from 'preact';

export default class Settings extends Component {
    render({ visible }) {
        if(!visible)
            return <div></div>
        
        return <div>Yay!</div>
    }
}