
import { getDefaultAvatarUrl } from 'common/app-state';
import { hash } from 'common/utils';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';


/**
 * A component that displays the gravatar of a provided email or a configured
 * default avatar.
 */
export class Avatar extends React.Component {
    static defaultProps = {
        email: ''
    };

    static propTypes = {
        defaultAvatarUrl: PropTypes.string,
        email: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { defaultAvatarUrl, email } = this.props;

        const avatarUrl = email
            ? `https://www.gravatar.com/avatar/${
                hash(email.trim().toLowerCase())}?d=wavatar`
            : defaultAvatarUrl;

        return (
            <img
                className = 'meeting-avatar'
                src = { avatarUrl }
                title = { email } />
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code Avatar}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        defaultAvatarUrl: getDefaultAvatarUrl(state)
    };
}

export default connect(mapStateToProps)(Avatar);
