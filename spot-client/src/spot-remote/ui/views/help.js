import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isSpotControllerApp } from 'common/detection';
import { ROUTES } from 'common/routing';
import { Button, View } from 'common/ui';
import { windowHandler } from 'common/utils';

import { setHasCompletedOnboarding } from '../../app-state';

/**
 * Displays a view with basic usage instructions for Spot Remote.
 *
 * @extends React.Component
 */
class Help extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object
    };

    /**
     * Gets the URL which point to the join code entry page.
     *
     * @returns {string}
     * @private
     */
    static _getSpotTvUrl() {
        return `${windowHandler.getBaseUrl()}${ROUTES.HOME}`;
    }

    /**
     * Initializes a new {@code Help} instance.
     *
     * @param {Object} props - The read-only properties with which the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onOkButtonClicked = this._onOkButtonClicked.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'help'>
                <div className = 'help-view'>
                    <div className = 'title'>
                        Welcome to Spot!
                    </div>
                    <div className = 'help-dialog'>
                        <div className = 'help-message'>
                            This app is a remote controller for a conference room.
                            <div>
                                Open { Help._getSpotTvUrl() } in a desktop Google Chrome browser in the conference room
                                to set it up and obtain a share key. Next enter the 6-character share key in this app.
                            </div>
                        </div>
                        <Button
                            className = 'ok-button'
                            onClick = { this._onOkButtonClicked }
                            qaId = 'help-continue'>
                            Continue
                        </Button>
                    </div>
                    {
                        isSpotControllerApp()
                            ? null
                            : this._renderLegalLinks()
                    }
                </div>
            </View>
        );
    }

    /**
     * Creates links to legal documents related to using Spot.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderLegalLinks() {
        return (
            <div className = 'legal-links'>
                <a
                    href = 'https://www.8x8.com/terms-and-conditions/privacy-policy'
                    rel = 'noopener noreferrer'
                    target = '_blank'>
                    Privacy Policy
                </a>
                <a
                    href = 'https://www.8x8.com/terms-and-conditions/8x8-end-user-terms-of-use'
                    rel = 'noopener noreferrer'
                    target = '_blank'>
                    Terms and Conditions
                </a>
            </div>
        );
    }

    /**
     * Takes the user to the join code entry page.
     *
     * @private
     * @returns {void}
     */
    _onOkButtonClicked() {
        this.props.dispatch(setHasCompletedOnboarding());
        this.props.history.push(ROUTES.CODE);
    }
}

export default connect()(Help);
