import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Button } from 'common/ui/components/button';
import { history } from 'common/history';
import { ROUTES } from 'common/routing';

/**
 * The conflict error page displayed when another Spot TV instance is already connected.
 *
 * @returns {ReactElement}
 */
export class Conflict extends React.Component {
    static propTypes = {
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
        const { t } = this.props;

        return (
            <div
                className = 'conflict'
                data-qa-id = 'conflict-view' >
                <div>{ t('appStatus.tvConflict') }</div>
                <Button
                    onClick = { this._onRetry }
                    qaId = 'conflict-retry' >
                    { t('buttons.retry') }
                </Button>
            </div>
        );
    }
}

export default withTranslation()(Conflict);
