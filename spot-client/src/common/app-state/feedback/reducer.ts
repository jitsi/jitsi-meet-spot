import { FEEDBACK_HIDE, FEEDBACK_SHOW } from './actionTypes';

interface IFeedbackState {
    show: boolean;
}

const DEFAULT_STATE: IFeedbackState = {
    show: false
};

/**
 * A {@code Reducer} to update the current Redux state for the 'feedback'
 * feature. The 'feedback' feature stores whether or not the app feedback
 * entry overlay should be displayed.
 *
 * @param state - The current Redux state for the 'feedback' feature.
 * @param action - The Redux state update payload.
 * @returns {Object}
 */
const feedback = (state: IFeedbackState = DEFAULT_STATE, action: any): IFeedbackState => {
    switch (action.type) {
    case FEEDBACK_HIDE:
        return {
            ...state,
            show: false
        };

    case FEEDBACK_SHOW:
        return {
            ...state,
            show: true
        };

    default:
        return state;
    }
};

export default feedback;
