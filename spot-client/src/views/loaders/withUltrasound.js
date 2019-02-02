import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getJoinCode } from 'reducers';
import { ultrasoundService } from 'ultrasound';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads the ultrasound library so it can be used to transmit and/or decode
 * ultrasound messages.
 *
 * @extends AbstractLoader
 */
class WithUltrasound extends AbstractLoader {
    static propTypes = {
        joinCode: PropTypes.string
    };

    /**
     * Enables and disables ultrasound as the app setting changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props.joinCode !== prevProps.joinCode) {
            ultrasoundService.setMessage(this.props.joinCode);
        }
    }

    /**
     * Disables ultrasound to ensure it no longer plays.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        ultrasoundService.setMessage('');
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {};
    }

    /**
     * Loads the files necessary for ultrasound.
     *
     * @override
     */
    _loadService() {
        return Promise.resolve()
            .then(() => ultrasoundService.setMessage(this.props.joinCode));
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
    return {
        joinCode: getJoinCode(state)
    };
}

const ConnectedWithUltrasound = connect(mapStateToProps)(WithUltrasound);

export default generateWrapper(ConnectedWithUltrasound);
