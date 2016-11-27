import React from 'react'

export default class ReactHint extends React.Component {
	static _instance = null

	static get instance() {
		return ReactHint._instance
	}

	static set instance(instance) {
		if (instance) {
			document.addEventListener('mouseover', instance.onHover)
		} else {
			document.removeEventListener('mouseover',
				ReactHint.instance.onHover)
		}

		ReactHint._instance = instance
	}

	static defaultProps = {
		className: 'react-hint'
	}

	state = {
		target: null,
		cls: null,
		at: 'top',
		top: 0,
		left: 0
	}

	shouldComponentUpdate({className}, {target, cls, at, top, left}) {
		const {props, state} = this
		return target !== state.target
			|| cls !== state.cls
			|| at !== state.at
			|| top !== state.top
			|| left !== state.left
			|| className !== props.className
	}

	componentDidMount() {
		if (ReactHint.instance) ReactHint.instance = null
		ReactHint.instance = this
	}

	componentDidUpdate() {
		const {target} = this.state
		if (!target) return

		const {top, left, width, height} = target.getBoundingClientRect()
		if (!(top || left || width || height)) return

		this.setState(this.getPosition(target))
	}

	componentWillUnmount() {
		ReactHint.instance = null
	}

	findHint = (el) => {
		while (el) {
			if (el === document) break
			if (el.hasAttribute('data-rh')) return el
			if (el === this._hint) return this.state.target
			el = el.parentNode
		} return null
	}

	getPosition = (target) => {
		const {_container, _hint} = this

		const {
			top: container_top,
			left: container_left,
		} = _container.getBoundingClientRect()

		const {
			width: hint_width,
			height: hint_height,
		} = _hint.getBoundingClientRect()

		const {
			top: target_top,
			left: target_left,
			width: target_width,
			height: target_height,
		} = target.getBoundingClientRect()

		let top, left
		const at = target.getAttribute('data-rh-at') || 'top'

		switch (at) {
			case 'left':
				top = target_height - hint_height >> 1
				left = -hint_width
				break

			case 'right':
				top = target_height - hint_height >> 1
				left = target_width
				break

			case 'bottom':
				top = target_height
				left = target_width - hint_width >> 1
				break

			case 'top':
			default:
				top = -hint_height
				left = target_width - hint_width >> 1
		}

		return {
			at,
			top: top + target_top - container_top,
			left: left + target_left - container_left
		}
	}

	onHover = ({target}) => {
		clearTimeout(this.timeout)
		this.timeout = setTimeout(() => {
			target = this.findHint(target)
			const cls = target ? target.getAttribute('data-rh-cls') : null
			this.setState({target, cls})
		}, 100)
	}

	setRef = (name, ref) =>
		this[name] = ref

	renderContent = (target) => {
		const text = target.getAttribute('data-rh')

		if (text[0] === '#') {
			const el = document.getElementById(text.slice(1))
			if (el) return <span dangerouslySetInnerHTML={{__html: el.innerHTML}} />
		}

		return text
	}

	render() {
		const {className} = this.props
		const {target, cls, at, top, left} = this.state

		return (
			<div style={{position: 'relative'}}
				ref={this.setRef.bind(this, '_container')}>
					{target &&
						<div className={`${className} ${className}--${at} ${cls}`}
							ref={this.setRef.bind(this, '_hint')}
							style={{top, left}}>
								<div className={`${className}__content`}>
									{this.renderContent(target)}
								</div>
						</div>
					}
			</div>
		)
	}
}