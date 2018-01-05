import React from 'react';
import PropTypes from 'prop-types';

import { DEFAULT_AVATAR_URL } from 'app-constants';

import styles from './scheduled-meeting.css';

export default class Avatar extends React.Component {
    static propTypes = {
        email: PropTypes.string
    };

    render() {
        return (
            <img
                className = {styles.avatar }
                title = { this.props.email }
                src = { this._generateAvatarUrl() } />
        );
    }

    _generateAvatarUrl() {
        const { email } = this.props;

        if (email) {
            return 'https://www.gravatar.com/avatar/' +
                email.trim().toLowerCase() +
                '?size=30';
        }

        return DEFAULT_AVATAR_URL;
    }
}

