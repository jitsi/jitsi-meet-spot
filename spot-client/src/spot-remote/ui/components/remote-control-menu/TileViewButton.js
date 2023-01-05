import {
    getInMeetingStatus,
    getOptimisticTileViewState,
    isTileViewChangePending,
    setTileView
} from 'common/app-state';
import { BorderAllOutlined } from 'common/icons';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { NavButton } from './../nav';

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function TileViewButton({ changePending, onSetTileView, t, tileView }) {
    const translationKey = tileView
        ? 'commands.tileViewExit'
        : 'commands.tileViewEnter';
    const qaId = tileView ? 'exit-tile-view' : 'enter-tile-view';

    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetTileView(!tileView);
    }, [ changePending, onSetTileView, tileView ]);

    return (
        <NavButton
            active = { tileView }
            label = { t(translationKey) }
            onClick = { onClick }
            qaId = { qaId }>
            <BorderAllOutlined />
        </NavButton>
    );
}

TileViewButton.propTypes = {
    changePending: PropTypes.bool,
    onSetTileView: PropTypes.func,
    t: PropTypes.func,
    tileView: PropTypes.bool
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code TileViewButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const optimisticTileViewState = getOptimisticTileViewState(state);

    return {
        tileView: typeof optimisticTileViewState === 'undefined'
            ? getInMeetingStatus(state).tileView : optimisticTileViewState,
        changePending: isTileViewChangePending(state)
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
        onSetTileView(tileView) {
            dispatch(setTileView(tileView));
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(TileViewButton)
);
