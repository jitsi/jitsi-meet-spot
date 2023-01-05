import { getDisplayName } from 'common/app-state';
import { history } from 'common/history';
import { ROUTES } from 'common/routing';
import { Button } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


/**
 * The conflict error page displayed when another Spot TV instance is already connected.
 *
 * @returns {ReactElement}
 */
export class Conflict extends React.Component {
    static propTypes = {
        roomName: PropTypes.string,
        t: PropTypes.func
    };

    /**
     * Creates new instance.
     *
     * @param {Object} props - React component props.
     */
    constructor(props) {
        super(props);

        this._onRetry = this._onRetry.bind(this);
    }

    /**
     * Called when the retry button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onRetry() {
        history.push(ROUTES.HOME);
    }

    /**
     * Renders.
     *
     * @returns {ReactElement}
     */
    render() {
        const { roomName, t } = this.props;

        return (
            <div
                className = 'conflict'
                data-qa-id = 'conflict-view' >
                <div>{ t('appStatus.tvConflict', { roomName }) }</div>
                <Button
                    onClick = { this._onRetry }
                    qaId = 'conflict-retry' >
                    { t('buttons.retry') }
                </Button>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code Conflict}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        roomName: getDisplayName(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(Conflict));
