import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { isReconnecting } from 'common/app-state';
import { Sync } from 'common/icons';

/**
 * A UI element to denote a remote control connection is being stored.
 */
export class ReconnectIndicator extends React.Component {
    static propTypes = {
        isReconnecting: PropTypes.bool,
        t: PropTypes.func
    };

    /**
     * Clears the connection indicator display when no longer reconnecting.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props, state) {
        if (!props.isReconnecting && state.showIndicator) {
            return {
                showIndicator: false
            };
        }

        return null;
    }

    /**
     * Initializes a new {@code ReconnectIndicator} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            showIndicator: false
        };

        this._showIndicatorTimeout = null;
    }

    /**
     * Sets a timeout to show a connection indicator if a reconnect in flight
     * is taking a while.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.isReconnecting && this.props.isReconnecting) {
            this._showIndicatorTimeout = setTimeout(() => {
                this.setState({
                    showIndicator: true
                });
            }, 5000);
        } else if (!this.props.isReconnecting && prevProps.isReconnecting) {
            clearTimeout(this._showIndicatorTimeout);
        }
    }

    /**
     * Cleans up the any timeout in flight for showing the connection indicator.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._showIndicatorTimeout);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.props.isReconnecting || !this.state.showIndicator) {
            return null;
        }

        return (
            <div
                className = 'reconnect-indicator'
                data-qa-id = 'reconnect-indicator'>
                <Sync />
                { this.props.t('appStatus.reconnecting') }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code App}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isReconnecting: isReconnecting(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(ReconnectIndicator));
