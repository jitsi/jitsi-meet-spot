import PropTypes from 'prop-types';
import React from 'react';

import { ROUTES } from 'common/routing';
import { Button, View } from 'common/ui';
import { windowHandler } from 'common/utils';

/**
 * Displays a view with basic usage instructions for Spot Remote.
 *
 * @extends React.Component
 */
class Help extends React.Component {
    static propTypes = {
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
        const spotTvHomeUrl = Help._getSpotTvUrl();

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
                                Open&nbsp;
                                <a
                                    className = 'spot-home-link'
                                    href = { spotTvHomeUrl } >
                                    { spotTvHomeUrl }
                                </a>
                                &nbsp;in a browser to setup your conference room and obtain a share key.
                            </div>
                        </div>
                        <Button
                            className = 'ok-button'
                            onClick = { this._onOkButtonClicked } >
                            OK
                        </Button>
                    </div>
                </div>
            </View>
        );
    }

    /**
     * Takes the user to the join code entry page.
     *
     * @private
     * @returns {void}
     */
    _onOkButtonClicked() {
        this.props.history.push(ROUTES.CODE);
    }
}

export default Help;
