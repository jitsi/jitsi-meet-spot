import React from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_AVATAR_URL } from 'config';
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
export default function Avatar({ email }) {
    const avatarUrl = email
        ? `https://www.gravatar.com/avatar/${
            hash(email.trim().toLowerCase())}?d=wavatar`
        : DEFAULT_AVATAR_URL;

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
    email: PropTypes.string
};
