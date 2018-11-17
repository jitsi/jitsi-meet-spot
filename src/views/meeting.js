import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { MeetingFrame } from 'features/meeting-frame';
import { getDisplayName } from 'reducers';

import View from './view';

/**
 * Displays the jitsi conference.
 *
 * @extends React.Component
 */
export class Meeting extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        history: PropTypes.object,
        match: PropTypes.object
    };

    /**
     * Initializes a new {@code Meeting} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onMeetingLeave = this._onMeetingLeave.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        // TODO: handle the error case where no meeting name is present

        return (
            <View name = 'meeting'>
                <MeetingFrame
                    displayName = { this.props.displayName }
                    meetingName = { this.props.match.params.name }
                    onMeetingLeave = { this._onMeetingLeave } />
            </View>
        );
    }

    /**
     * Callback invoked when the conference ends. Attempts to redirect to the
     * home view.
     */
    _onMeetingLeave() {
        this.props.history.push('/');
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Meeting}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        displayName: getDisplayName(state)
    };
}

export default connect(mapStateToProps)(Meeting);
