import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';
import { Button, StatusOverlay } from 'common/ui';

/**
 * Displays an overlay to get confirmation before exiting the application.
 */
export class ExitVerification extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func,
        onVerification: PropTypes.func,
        productName: PropTypes.string,
        t: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { onCancel, onVerification, productName, t } = this.props;

        return (
            <StatusOverlay title = { t('appStatus.exitElectronConfirm', { productName }) }>
                <Button
                    appearance = 'subtle'
                    onClick = { onCancel }>
                    { t('buttons.cancel') }
                </Button>
                <Button onClick = { onVerification }>
                    { t('buttons.confirm') }
                </Button>
            </StatusOverlay>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        productName: getProductName(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(ExitVerification));
