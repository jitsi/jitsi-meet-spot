import { isReconnecting } from 'common/app-state';
import { Sync } from 'common/icons';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

/**
 * The type of the props of {@link ReconnectIndicator}.
 */
interface IProps {
    isReconnecting?: boolean;
    t?: (key: string) => string;
}

/**
 * The type of the state of {@link ReconnectIndicator}.
 */
interface IState {
    showIndicator: boolean;
}

/**
 * A UI element to denote a remote control connection is being stored.
 */
export class ReconnectIndicator extends React.Component<IProps, IState> {
    _showIndicatorTimeout: ReturnType<typeof setTimeout> | null;

    /**
     * Clears the connection indicator display when no longer reconnecting.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props: IProps, state: IState): Partial<IState> | null {
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
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
    componentDidUpdate(prevProps: IProps) {
        if (!prevProps.isReconnecting && this.props.isReconnecting) {
            this._showIndicatorTimeout = setTimeout(() => {
                this.setState({
                    showIndicator: true
                });
            }, 5000);
        } else if (!this.props.isReconnecting && prevProps.isReconnecting) {
            if (this._showIndicatorTimeout) {
                clearTimeout(this._showIndicatorTimeout);
            }
        }
    }

    /**
     * Cleans up the any timeout in flight for showing the connection indicator.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        if (this._showIndicatorTimeout) {
            clearTimeout(this._showIndicatorTimeout);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @returns
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
                { this.props.t?.('appStatus.reconnecting') }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code App}.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
function mapStateToProps(state: any) {
    return {
        isReconnecting: isReconnecting(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(ReconnectIndicator));
