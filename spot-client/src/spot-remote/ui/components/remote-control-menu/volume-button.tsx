import { ExpandLess, ExpandMore } from 'common/icons';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { adjustVolume } from '../../../remote-control';

const TYPE_UP = 'up';

interface IProps {
    _adjustVolume?: (direction: string) => void;
    type?: 'down' | 'up';
}

/**
 * Implements a volume control button.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
function VolumeButton({ _adjustVolume, type }: IProps) {
    const onClick = useCallback(() => {
        _adjustVolume?.(type as string);
    }, [ _adjustVolume, type ]);

    return (
        <button
            className = 'button volume touch-highlight'
            onClick = { onClick } >
            { type === TYPE_UP ? <ExpandLess /> : <ExpandMore /> }
        </button>
    );
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Dispatches the adjust volume action.
         *
         * @param direction - One of 'up', 'down'.
         * @private
         * @returns {void}
         */
        _adjustVolume(direction: string) {
            dispatch(adjustVolume(direction));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(VolumeButton);
