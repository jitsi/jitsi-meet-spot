import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    getPrivacyPolicyURL,
    getProductName,
    getTermsAndConditionsURL
} from 'common/app-state';
import { isBackendEnabled } from 'common/backend';
import { isSpotControllerApp } from 'common/detection';
import { history } from 'common/history';
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
        codeLength: PropTypes.number,
        onContinue: PropTypes.func,
        privacyPolicyURL: PropTypes.string,
        productName: PropTypes.string,
        t: PropTypes.func,
        termsAndConditionsURL: PropTypes.string
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
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { codeLength, onContinue, productName, t } = this.props;

        return (
            <View name = 'help'>
                <div className = 'help-view'>
                    <div className = 'title'>
                        { t('welcome', { productName }) }
                    </div>
                    <div className = 'help-dialog'>
                        <div className = 'help-message'>
                            { t('help.isRemote') }
                            <div>
                                {
                                    t('help.howToConnect', {
                                        url: Help._getSpotTvUrl(),
                                        codeLength
                                    })
                                }
                            </div>
                        </div>
                        <Button
                            className = 'ok-button'
                            onClick = { onContinue }
                            qaId = 'help-continue'>
                            { t('buttons.continue') }
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
                    href = { this.props.privacyPolicyURL }
                    rel = 'noopener noreferrer'
                    target = '_blank'>
                    Privacy Policy
                </a>
                <a
                    href = { this.props.termsAndConditionsURL }
                    rel = 'noopener noreferrer'
                    target = '_blank'>
                    Terms and Conditions
                </a>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code Help}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        codeLength: isSpotControllerApp(state) && isBackendEnabled(state) ? 8 : 6,
        privacyPolicyURL: getPrivacyPolicyURL(state),
        productName: getProductName(state),
        termsAndConditionsURL: getTermsAndConditionsURL(state)
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
        onContinue() {
            dispatch(setHasCompletedOnboarding());
            history.push(ROUTES.CODE);
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Help));
