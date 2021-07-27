import { h, Component } from 'preact'

import style from './style'

export default class BretSlider extends Component {
    state = {
        origin: null,
    }

    componentDidMount() {
        document.body.addEventListener('pointerup', this.onPointerUp)
        document.body.addEventListener('pointermove', this.onPointerMove)
    }

    componentWillUnmount() {
        document.body.removeEventListener('pointerup', this.onPointerUp)
        document.body.removeEventListener('pointermove', this.onPointerMove)
    }

    onContextMenu = (e) => {
        this.props.onChange(0)
        e.preventDefault()
    }

    onPointerDown = (e) => {
        this.setState({ origin: [ e.clientX, e.clientY ] })
    }

    onPointerUp = (e) => {
        this.setState({ origin: null })
    }

    onPointerMove = (e) => {
        if(this.state.origin) {
            const [ x, y ] = this.state.origin

            let newValue = this.props.value

            if(Math.abs(y - e.clientY) > 1) {
                this.setState({ origin: [ e.clientX, e.clientY ] })

                const direction = (y - e.clientY) < 0 ? -1 : 1
                const delta = (this.props.step || 1) * direction

                newValue += delta
            }
            
            if(Math.abs(x - e.clientX) > 1) {
                this.setState({ origin: [ e.clientX, e.clientY ] })

                const direction = (x - e.clientX) < 0 ? 1 : -1
                const delta = (this.props.step || 1) * direction

                newValue += delta
            }

            this.props.onChange && this.props.onChange(newValue)

            e.preventDefault()
            e.stopPropagation()
        }
    }

    render() {
        return <span
            class={style.bretSlider}
            onPointerDown={this.onPointerDown}
            onContextMenu={this.onContextMenu}>
                {this.props.step < 1 ? this.props.value.toFixed(2) : this.props.value}
            </span>
    }
}
