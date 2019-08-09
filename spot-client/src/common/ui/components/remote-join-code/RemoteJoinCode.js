import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRemoteJoinCode } from 'common/app-state';

/**
 * Displays the (temporary) code for connecting a Spot-Remote to a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function RemoteJoinCode(props) {
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

RemoteJoinCode.propTypes = {
    qaId: PropTypes.string,
    remoteJoinCode: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of {@code RemoteJoinCode}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        remoteJoinCode: getRemoteJoinCode(state)
    };
}

export default connect(mapStateToProps)(RemoteJoinCode);
