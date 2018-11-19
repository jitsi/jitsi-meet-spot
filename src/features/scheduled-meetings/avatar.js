import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { hash } from 'utils';

import styles from './scheduled-meeting.css';

/**
 * A component that displays the gravatar of a provided email or a configured
 * default avatar.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function Avatar({ defaultAvatarUrl, email }) {
    const avatarUrl = email
        ? `https://www.gravatar.com/avatar/${
            hash(email.trim().toLowerCase())}?d=wavatar`
        : defaultAvatarUrl;

    return (
        <img
            className = { styles.avatar }
            title = { email }
            src = { avatarUrl } />
    );
}

Avatar.defaultProps = {
    email: ''
};

Avatar.propTypes = {
    defaultAvatarUrl: PropTypes.string,
    email: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of {@code Avatar}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        defaultAvatarUrl: state.config.DEFAULT_AVATAR_URL
    };
}

export default connect(mapStateToProps)(Avatar);
