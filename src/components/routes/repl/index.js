import { h, Component } from 'preact';

import style from './style';

export default class Repl extends Component {
    state = {
        buffer: ["> help dev"],
        lastCmd: "",
        autoCmd: "help dev", // sent on first load to show available commands to user
    }

    componentWillMount() {
		this.componentWillReceiveProps(this.props)
    }

    componentDidMount() {
        this.inputEl.focus()
    }

    componentDidUpdate() {
        this.preEl.scrollTop = this.preEl.scrollHeight
    }

	componentWillUnmount() {
		this.props.stream.off('repl', this.writeToBuffer)
	}

	componentWillReceiveProps(newProps) {
		if(this.props.stream)
			this.props.stream.off('repl', this.writeToBuffer)

        newProps.stream.on('repl', this.writeToBuffer)

        if(this.state.autoCmd) {
            newProps.stream.repl(this.state.autoCmd)
            this.setState({ autoCmd: null })
        }
	}

    sendCommand = (e) => {
        e.preventDefault()

        const input = e.currentTarget.querySelector('input')
        const cmd = input.value

        if(cmd.startsWith('/')) {
            this.setState({ buffer: [] })
        } else {
            this.writeToBuffer(`> ${cmd}`)
            this.props.stream.repl(cmd)
        }

        input.value = ""
        this.setState({ lastCmd: cmd })
    }

    writeToBuffer = (resp) => this.setState({ buffer: [...this.state.buffer, resp.replace(/\t/g, '')] })

    fillLastCommand = () => {
        this.inputEl.value = this.state.lastCmd

        const end = this.state.lastCmd.length
        setTimeout(() => this.inputEl.setSelectionRange(end, end), 0)
    }

    render({}, { buffer }) {
        return <div class={style.repl}>
            <div class={style.wrapper}>
                <pre ref={(el) => this.preEl = el}>{ buffer.join("\n") }</pre>

                <form onSubmit={this.sendCommand}>
                    <input placeholder="Command..."
                        onKeyDown={(e) => e.code == "ArrowUp" && this.fillLastCommand()}
                        ref={(el) => this.inputEl = el} />
                </form>
            </div>
        </div>
    }
}