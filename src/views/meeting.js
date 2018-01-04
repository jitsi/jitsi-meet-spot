import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { MeetingFrame } from 'features/meeting-frame';

import View from './view';

export class MeetingView extends React.Component {
    static propTypes = {
        history: PropTypes.object,
        match: PropTypes.object
    };

    constructor(props) {
        super(props);

        this._onMeetingLeave = this._onMeetingLeave.bind(this);
    }

    render() {
        return (
            <View>
                <MeetingFrame
                    meetingName = { this.props.match.params.name }
                    onMeetingLeave = { this._onMeetingLeave } />
            </View>
        );
    }

    _onMeetingLeave() {
        this.props.history.push('/');
    }
}

export default connect()(MeetingView);
