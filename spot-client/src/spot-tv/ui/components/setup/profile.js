import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
    getAvatarUrl,
    getCalendarName,
    getDisplayName,
    setAvatarUrl,
    setDisplayName
} from 'common/app-state';
import { Button, Input } from 'common/ui';

/**
 * Prompts to set a display name and an avatar url for the Spot-TV to use during
 * meetings.
 *
 * @extends React.Component
 */
export class Profile extends React.Component {
    static propTypes = {
        avatarUrl: PropTypes.string,
        dispatch: PropTypes.func,
        displayName: PropTypes.string,
        onSetAvatarUrl: PropTypes.func,
        onSetDisplayName: PropTypes.func,
        onSuccess: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code Profile} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            avatarUrl: props.avatarUrl || '',
            displayName: props.displayName || ''
        };

        this._onAvatarUrlChange = this._onAvatarUrlChange.bind(this);
        this._onDisplayNameChange = this._onDisplayNameChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { t } = this.props;

        return (
            <div className = 'spot-setup setup-step'>
                <div className = 'setup-title'>
                    { t('setup.profile') }
                </div>
                <div className = 'setup-content'>
                    <Input
                        onChange = { this._onDisplayNameChange }
                        placeholder = { t('setup.name') }
                        value = { this.state.displayName } />
                    <Input
                        onChange = { this._onAvatarUrlChange }
                        placeholder = { t('setup.avatar') }
                        value = { this.state.avatarUrl } />
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onSubmit }>
                        { t('buttons.submit') }
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Callback invoked to update the known entered room avatar url.
     *
     * @param {Event} event - The change event for updating the entered avatar
     * url.
     * @private
     * @returns {void}
     */
    _onAvatarUrlChange(event) {
        this.setState({
            avatarUrl: event.target.value
        });
    }

    /**
     * Callback invoked to update the known entered room display name.
     *
     * @param {Event} event - The change event for updating the entered room
     * display name.
     * @private
     * @returns {void}
     */
    _onDisplayNameChange(event) {
        this.setState({
            displayName: event.target.value
        });
    }

    /**
     * Callback invoked to save the entered display name and avatar url.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        if (!this.state.displayName.trim()) {
            return;
        }

        this.props.onSetAvatarUrl(this.state.avatarUrl.trim());
        this.props.onSetDisplayName(this.state.displayName.trim());

        this.props.onSuccess();
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Profile}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        avatarUrl: getAvatarUrl(state),
        displayName: getDisplayName(state) || getCalendarName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onSetAvatarUrl(avatarUrl) {
            dispatch(setAvatarUrl(avatarUrl));
        },

        onSetDisplayName(displayName) {
            dispatch(setDisplayName(displayName));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(Profile)
);
