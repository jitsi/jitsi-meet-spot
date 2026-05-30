import { getSpotRoomName } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';

/**
 * The props for {@link RoomName}.
 */
interface IProps {
    roomName?: string;
}

/**
 * Displays the currently configured Spot-Room name.
 */
export class RoomName extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'room-name'>
                { this.props.roomName }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RoomName}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        roomName: getSpotRoomName(state)
    };
}

export default connect(mapStateToProps)(RoomName);
