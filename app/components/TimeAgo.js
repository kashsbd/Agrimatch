import React, { Component } from 'react';
import { Text } from 'react-native';
import moment from 'moment';

export class TimeAgo extends Component {
	state = { timer: null };

	static defaultProps = {
		hideAgo: false,
		interval: 60000,
	};

	componentDidMount() {
		this.createTimer();
	}

	createTimer = () => {
		this.setState({
			timer: setTimeout(() => {
				this.update();
			}, this.props.interval),
		});
	};

	componentWillUnmount() {
		clearTimeout(this.state.timer);
	}

	update = () => {
		this.forceUpdate();
		this.createTimer();
	};

	render() {
		const { time, hideAgo } = this.props;

		const timeString =
			moment(time).fromNow(hideAgo) === 'a few seconds ago'
				? 'just now'
				: moment(time).fromNow(hideAgo);

		return <Text {...this.props}>{timeString}</Text>;
	}
}
