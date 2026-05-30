import {
    getInMeetingStatus,
    getOptimisticTileViewState,
    isTileViewChangePending,
    setTileView
} from 'common/app-state';
import { BorderAllOutlined } from 'common/icons';
import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { NavButton } from './../nav';

interface IProps {
    changePending?: boolean;
    onSetTileView?: (tileView: boolean) => void;
    t?: (key: string) => string;
    tileView?: boolean;
}

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @param props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function TileViewButton({ changePending, onSetTileView, t, tileView }: IProps) {
    const translationKey = tileView
        ? 'commands.tileViewExit'
        : 'commands.tileViewEnter';
    const qaId = tileView ? 'exit-tile-view' : 'enter-tile-view';

    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetTileView?.(!tileView);
    }, [ changePending, onSetTileView, tileView ]);

    return (
        <NavButton
            active = { tileView }
            label = { t?.(translationKey) }
            onClick = { onClick }
            qaId = { qaId }>
            <BorderAllOutlined />
        </NavButton>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code TileViewButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
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
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        onSetTileView(tileView: boolean) {
            dispatch(setTileView(tileView));
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(TileViewButton)
);
