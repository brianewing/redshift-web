import { h, Component } from 'preact'

import style from './style'

export default class BretSlider extends Component {
    state = {
        mouseDownPosition: null,
    }

    componentDidMount() {
        document.body.addEventListener('mouseup', this.onMouseUp)
        document.body.addEventListener('mousemove', this.onMouseMove)
    }

    componentWillUnmount() {
        document.body.removeEventListener('mouseup', this.onMouseUp)
        document.body.removeEventListener('mousemove', this.onMouseMove)
    }

    onContextMenu = (e) => {
        this.props.onChange(0)
    }

    onMouseDown = (e) => {
        this.setState({ mouseDownPosition: [ e.clientX, e.clientY ] })
    }

    onMouseUp = (e) => {
        this.setState({ mouseDownPosition: null })
    }

    onMouseMove = (e) => {
        if(this.state.mouseDownPosition) {
            const [ x, y ] = this.state.mouseDownPosition

            if(Math.abs(y - e.clientY) > 2) {
                this.setState({ mouseDownPosition: [ e.clientX, e.clientY ] })

                const direction = (y - e.clientY) < 0 ? -1 : 1
                const delta = (this.props.step || 1) * direction
                const newValue = this.props.value + delta

                this.props.onChange && this.props.onChange(newValue)
            } else if(Math.abs(x - e.clientX) > 2) {
                this.setState({ mouseDownPosition: [ e.clientX, e.clientY ] })

                const direction = (x - e.clientX) < 0 ? 1 : -1
                const delta = (this.props.step || 1) * direction
                const newValue = this.props.value + delta

                this.props.onChange && this.props.onChange(newValue)
            }
        }
    }

    render() {
        return <span
            class={style.bretSlider}
            onMouseDown={this.onMouseDown}
            onContextMenu={this.onContextMenu}>
                {this.props.step < 1 ? this.props.value.toFixed(2) : this.props.value}
            </span>
    }
}
