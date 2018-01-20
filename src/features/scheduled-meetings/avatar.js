import React from 'react';
import PropTypes from 'prop-types';
import { hash } from 'utils';
import styles from './scheduled-meeting.css';

export const DEFAULT_AVATAR_URL = 'https://meet.jit.si/images/avatar.png';

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
