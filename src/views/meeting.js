import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { MeetingFrame } from 'features/meeting-frame';
import { getDisplayName } from 'reducers';

import View from './view';

// TODO: handle the error case where no meeting name is present
export class MeetingView extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
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
                    displayName = { this.props.displayName }
                    meetingName = { this.props.match.params.name }
                    onMeetingLeave = { this._onMeetingLeave } />
            </View>
        );
    }

    _onMeetingLeave() {
        this.props.history.push('/');
    }
}

function mapStateToProps(state) {
    return {
        displayName: getDisplayName(state)
    };
}

export default connect(mapStateToProps)(MeetingView);
