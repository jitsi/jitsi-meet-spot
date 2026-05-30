import { getInMeetingStatus } from 'common/app-state';
import { MicOff, VideocamOff } from 'common/icons';
import React from 'react';
import { connect } from 'react-redux';


import StatusIcon from './status-icon';

/**
 * The props of {@code MeetingStatus}.
 */
interface IProps {
    audioMuted?: boolean;
    videoMuted?: boolean;
}

/**
 * Displays Spot-TV in-meeting status, such as mute states.
 */
export class MeetingStatus extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'meeting-status'>
                {
                    this.props.audioMuted && (
                        <StatusIcon qaId = 'audio-muted-status'>
                            <MicOff />
                        </StatusIcon>
                    )
                }
                {
                    this.props.videoMuted && (
                        <StatusIcon qaId = 'video-muted-status'>
                            <VideocamOff />
                        </StatusIcon>
                    )
                }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code MeetingStatus}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        ...getInMeetingStatus(state)
    };
}

export default connect(mapStateToProps)(MeetingStatus);
