import React from 'react';
import PropTypes from 'prop-types';

import { DEFAULT_AVATAR_URL } from 'app-constants';
import { hash } from 'utils';

import styles from './scheduled-meeting.css';

export default class Avatar extends React.Component {
    static propTypes = {
        email: PropTypes.string
    };

    render() {
        return (
            <img
                className = { styles.avatar }
                title = { this.props.email }
                src = { this._generateAvatarUrl() } />
        );
    }

    _generateAvatarUrl() {
        return this.props.email
            ? `https://www.gravatar.com/avatar/${
                hash(this.props.email.trim().toLowerCase())}?d=wavatar`
            : DEFAULT_AVATAR_URL;
    }
}

