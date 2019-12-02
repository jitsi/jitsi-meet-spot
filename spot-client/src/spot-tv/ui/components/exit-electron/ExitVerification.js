import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { addNotification, getProductName } from 'common/app-state';
import { logger } from 'common/logger';
import { Button, LoadingIcon, StatusOverlay } from 'common/ui';

import { fetchExitPassword } from 'spot-tv/app-state';

const VIEW_LOADING = 'loading';
const VIEW_ENTER_PASSWORD = 'password';
const VIEW_EXIT_CONFIRMATION = 'confirmation';

/**
 * The component will first try to fetch the exit password and if it's defined it will ask the user to enter it,
 * otherwise will ask for the exit action confirmation.
 */
export class ExitVerification extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func,
        onPasswordInvalid: PropTypes.func,
        onSomethingWentWrong: PropTypes.func,
        onVerification: PropTypes.func,
        productName: PropTypes.string,
        t: PropTypes.func
    };

    /**
     * A constructor.
     *
     * @param {Object} props - React props.
     */
    constructor(props) {
        super(props);

        this.state = {
            viewToDisplay: VIEW_LOADING
        };

        this._onPasswordSubmit = this._onPasswordSubmit.bind(this);
        this._onInputChanged = this._onInputChanged.bind(this);
    }

    /**
     * Shows the loading screen while the exit password is being checked.
     *
     * @returns {void}
     */
    componentDidMount() {
        // Intentionally there's no reject handler because the fetchExitPassword action must never fail.
        // When the network request fails it should either return 'undefined' or the most recently cached value.
        fetchExitPassword()
            .then(exitPassword => {
                if (exitPassword) {
                    this.setState({
                        viewToDisplay: VIEW_ENTER_PASSWORD,
                        exitPassword
                    });
                } else {
                    this.setState({
                        viewToDisplay: VIEW_EXIT_CONFIRMATION
                    });
                }
            });
    }

    /**
     * Stores the entered password in the component instance.
     *
     * @param {Object} event - The input changed event object.
     * @private
     * @returns {void}
     */
    _onInputChanged(event) {
        this._enteredPassword = event.target.value;
    }

    /**
     * Triggered when the submit event happens on the password input form.
     *
     * @param {Object} event - The input changed event object.
     * @private
     * @returns {void}
     */
    _onPasswordSubmit(event) {
        event.preventDefault();

        if (this.state.exitPassword === this._enteredPassword) {
            this.props.onVerification();
        } else {
            this.props.onPasswordInvalid();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { onCancel, onVerification, productName, t } = this.props;

        switch (this.state.viewToDisplay) {
        case VIEW_EXIT_CONFIRMATION:
            return (
                <StatusOverlay
                    qaId = 'exit-electron-confirmation'
                    title = { t('appStatus.exitElectronConfirm', { productName }) }>
                    <Button
                        appearance = 'subtle'
                        onClick = { onCancel }
                        qaId = 'exit-electron-cancel' >
                        { t('buttons.cancel') }
                    </Button>
                    <Button
                        onClick = { onVerification }
                        qaId = 'exit-electron-confirm' >
                        { t('buttons.confirm') }
                    </Button>
                </StatusOverlay>
            );
        case VIEW_LOADING:
            return (
                <StatusOverlay
                    qaId = 'exit-electron-loading'
                    title = { t('appStatus.pleaseWait') }>
                    <LoadingIcon />
                </StatusOverlay>
            );
        case VIEW_ENTER_PASSWORD:
            return (
                <StatusOverlay qaId = 'exit-electron-password-prompt' >
                    <form onSubmit = { this._onPasswordSubmit }>
                        <div className = 'close-electron-password-input'>
                            <input
                                data-qa-id = 'exit-electron-password-input'
                                onChange = { this._onInputChanged }
                                placeholder = { t('appStatus.exitElectronAskForPassword') }
                                type = 'text' />
                        </div>
                        <Button
                            appearance = 'subtle'
                            onClick = { onCancel }
                            qaId = 'exit-electron-cancel' >
                            { t('buttons.cancel') }
                        </Button>
                        <Button
                            onClick = { this._onPasswordSubmit }
                            qaId = 'exit-electron-confirm' >
                            { t('buttons.submit') }
                        </Button>
                    </form>
                </StatusOverlay>
            );
        default:
            logger.error('Invalid display state', { viewToDisplay: this.state.viewToDisplay });

            onCancel();

            return null;
        }
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

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Handles the invalid password error.
         *
         * @returns {void}
         */
        onPasswordInvalid() {
            dispatch(addNotification(
                'error',
                'appEvents.invalidPassword'
            ));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExitVerification));
