import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getRemoteJoinCode, getUltrasoundConfig } from 'common/app-state';
import { logger } from 'common/logger';
import { AbstractLoader, generateWrapper } from 'common/ui';

import { ultrasoundService } from './../../ultrasound';

/**
 * Loads the ultrasound library so it can be used to transmit and/or decode
 * ultrasound messages.
 *
 * @extends AbstractLoader
 */
class WithUltrasound extends AbstractLoader {
    static propTypes = {
        remoteJoinCode: PropTypes.string
    };

    /**
     * Initializes a new {@code WithUltrasound} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, 'Ultrasound');
    }

    /**
     * Enables and disables ultrasound as the app setting changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props.remoteJoinCode !== prevProps.remoteJoinCode) {
            this._setUltrasoundMessage(this.props.remoteJoinCode);
        }
    }

    /**
     * Disables ultrasound to ensure it no longer plays.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._setUltrasoundMessage();
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            ultrasoundService
        };
    }

    /**
     * Loads the files necessary for ultrasound.
     *
     * @override
     */
    _loadService() {
        if (!this._shouldPlayUltrasound()) {
            return Promise.resolve();
        }

        return ultrasoundService.initialize(
            this.props.emscriptenPath,
            this.props.memoryInitializerPath)
            .then(() => this._setUltrasoundMessage(this.props.remoteJoinCode))
            .catch(() => logger.error(
                'Failed to initialize ultrasound. Continuing without.'));
    }

    /**
     * Helper function to set the ultrasound message to play if the environment
     * supports ultrasound.
     *
     * @param {string} message - The message to be transmitted.
     * @private
     * @returns {void}
     */
    _setUltrasoundMessage(message) {
        if (!this._shouldPlayUltrasound()) {
            return;
        }

        logger.log('withUltrasound updating message');

        ultrasoundService.setMessage(message);
    }

    /**
     * For now support for ultrasound is being limited. This limit has not been
     * vetted fully and should be subject to change.
     *
     * @returns {boolean}
     */
    _shouldPlayUltrasound() {
        const envRegex = new RegExp(this.props.envRegex);

        return envRegex.exec(window.navigator.userAgent.toLocaleLowerCase());
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WithUltrasound}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const {
        EMSCRIPTEN_PATH,
        MEM_INITIALIZER_PATH,
        SUPPORTED_ENV_REGEX
    } = getUltrasoundConfig(state);

    return {
        emscriptenPath: EMSCRIPTEN_PATH,
        envRegex: SUPPORTED_ENV_REGEX,
        memoryInitializerPath: MEM_INITIALIZER_PATH,
        remoteJoinCode: getRemoteJoinCode(state)
    };
}

const ConnectedWithUltrasound = connect(mapStateToProps)(WithUltrasound);

export default generateWrapper(ConnectedWithUltrasound);
