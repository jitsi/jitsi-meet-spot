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
        return this.props.email
            ? `https://www.gravatar.com/avatar/${
                this.props.email.trim().toLowerCase()}?size=30`
            : DEFAULT_AVATAR_URL;
    }
}

