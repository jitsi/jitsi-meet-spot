import type { RootState } from 'common/app-state';
import {
    getInMeetingStatus,
    getOptimisticWhiteboardState,
    isWhiteboardChangePending,
    setWhiteboard
} from 'common/app-state';
import { Whiteboard } from 'common/icons';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NavButton } from './../../nav';

/**
 * A component for displaying and changing the current whiteboard visibility
 * of a Spot-TV.
 *
 * @returns {ReactElement}
 */
export default function WhiteboardButton(): JSX.Element | null {
    const dispatch = useDispatch();

    const optimisticWhiteboardState = useSelector(getOptimisticWhiteboardState);
    const inMeetingWhiteboardOpen = useSelector((state: RootState) => getInMeetingStatus(state).whiteboardOpen);
    const whiteboardOpen = typeof optimisticWhiteboardState === 'undefined'
        ? inMeetingWhiteboardOpen
        : optimisticWhiteboardState;
    const changePending = useSelector(isWhiteboardChangePending);
    const isLocalModerator = useSelector((state: RootState) => Boolean(state.spotTv.isLocalModerator));
    const isWhiteboardInitialized = useSelector((state: RootState) => Boolean(state.spotTv.whiteboardInitialized));

    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        dispatch(setWhiteboard(!whiteboardOpen));
    }, [ changePending, dispatch, whiteboardOpen ]);

    if (!isLocalModerator && !isWhiteboardInitialized) {
        return null;
    }

    return (
        <NavButton
            active = { changePending ? !whiteboardOpen : whiteboardOpen }
            className = { `whiteboard-button ${changePending ? 'pending' : ''}` }
            onClick = { onClick }
            qaId = { whiteboardOpen ? 'hide-whiteboard' : 'show-whiteboard' }>
            <Whiteboard />
        </NavButton>
    );
}
