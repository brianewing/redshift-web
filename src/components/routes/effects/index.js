import { h, Component } from 'preact';
import linkState from 'linkstate';

import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

import GoEllipsis from 'react-icons/lib/go/ellipsis';

import style from './style';

export default class Effects extends Component {
	componentWillReceiveProps(props) {
		let { effects } = this.state
		if(!effects && props.effects) {
			this.setState({ effects: props.effects })
		}
	}

	send = () => this.props.onSend && this.props.onSend(this.state.effects)

	onSortEnd = ({oldIndex, newIndex}) => {
		this.setState({effects: arrayMove(this.state.effects, oldIndex, newIndex)})
		this.send()
	}

	render({}, { effects }) {
		return <div class={style.effects}>
			{<List items={effects} onSortEnd={this.onSortEnd} />}
		</div>
	}
}

@SortableContainer
class List extends Component {
	render({ items }) {
		return <ul>
			{items && items.map((value, index) => <Effect key={`item-${index}`} index={index} value={value} />)}
		</ul>
	}
}

@SortableElement
class Effect extends Component {
	render({ value }) {
		return <li>
			<GoEllipsis /> <strong>{value.Type}</strong>
			{ " {" }
				{Object.entries(value.Params).map(([key, value]) => {
					return <span><strong> {key}</strong> {JSON.stringify(value)}</span>
					// return <span><strong> {key}</strong> {this.renderValue(value, key)}</span>;
				})}
			{ " }" }
		</li>
	}
}