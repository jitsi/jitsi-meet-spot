import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { ExpandLess, ExpandMore } from 'common/icons';

import { adjustVolume } from '../../../remote-control';

const TYPE_DOWN = 'down';
const TYPE_UP = 'up';

/**
 * Implements a volume control button.
 */
class VolumeButton extends React.Component {
    static propTypes = {
        _adjustVolume: PropTypes.func,
        type: PropTypes.oneOf([ TYPE_DOWN, TYPE_UP ])
    };

    /**
     * Instantiates a new instance of the {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <button
                className = 'button volume touch-highlight'
                onClick = { this._onClick } >
                { this.props.type === TYPE_UP ? <ExpandLess /> : <ExpandMore /> }
            </button>
        );
    }

    /**
     * Callback to handle the onClick event of the button.
     *
     * @returns {void}
     */
    _onClick() {
        this.props._adjustVolume(this.props.type);
    }
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
