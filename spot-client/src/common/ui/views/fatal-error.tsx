import type { RootState } from 'common/app-state';
import { isSpot } from 'common/app-state';
import { ROUTES } from 'common/routing';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { Countdown, StatusOverlay } from './../components';

interface IProps {
    isSpotTV?: boolean;
    t: (key: string) => string;
}

/**
 * A component for showing a potentially fatal error has occurred and providing
 * the ability to reload the app or reset app state.
 *
 * @returns {ReactElement}
 */
export class FatalError extends React.Component<IProps> {
    /**
     * Initializes a new {@code FatalError} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._onReload = this._onReload.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <StatusOverlay title = { this.props.t('appStatus.unexpectedError') }>
                <div>{ this.props.t('appStatus.willReload') }</div>
                <Countdown
                    onCountdownComplete = { this._onReload }
                    startTime = { 10 } />
            </StatusOverlay>
        );
    }

    /**
     * Forces a reload of the window by redirecting to the root path.
     *
     * @private
     * @returns {void}
     */
    _onReload() {
        (window as any).location = this.props.isSpotTV ? ROUTES.HOME : ROUTES.CODE;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code FatalError}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        isSpotTV: isSpot(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(FatalError));
