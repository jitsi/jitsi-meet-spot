import { ExpandLess, ExpandMore } from 'common/icons';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { adjustVolume } from '../../../remote-control';

const TYPE_DOWN = 'down';
const TYPE_UP = 'up';

/**
 * Implements a volume control button.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
function VolumeButton({ _adjustVolume, type }) {
    const onClick = useCallback(() => {
        _adjustVolume(type);
    }, [ _adjustVolume, type ]);

    return (
        <button
            className = 'button volume touch-highlight'
            onClick = { onClick } >
            { type === TYPE_UP ? <ExpandLess /> : <ExpandMore /> }
        </button>
    );
}

VolumeButton.propTypes = {
    _adjustVolume: PropTypes.func,
    type: PropTypes.oneOf([ TYPE_DOWN, TYPE_UP ])
};

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
         * Dispatches the adjust volume action.
         *
         * @param {string} direction - One of 'up', 'down'.
         * @private
         * @returns {void}
         */
        _adjustVolume(direction) {
            dispatch(adjustVolume(direction));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(VolumeButton);
