import { getRemoteJoinCode } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';

interface IRemoteJoinCodeProps {
    qaId?: string;
    remoteJoinCode?: string;
}

/**
 * Displays the (temporary) code for connecting a Spot-Remote to a Spot-TV.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function RemoteJoinCode(props: IRemoteJoinCodeProps) {
    const {
        remoteJoinCode,
        qaId
    } = props;

    if (!remoteJoinCode) {
        return null;
    }

    return (
        <span
            className = 'join-code'
            data-qa-id = { qaId }>
            { remoteJoinCode }
        </span>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code RemoteJoinCode}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        remoteJoinCode: getRemoteJoinCode(state)
    };
}

export default connect(mapStateToProps)(RemoteJoinCode);
