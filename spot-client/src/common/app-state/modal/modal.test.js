import { combineReducers, createStore } from 'redux';

import { routeChanged } from '../route/actions';

import * as actions from './actions';
import modalReducer from './reducer';
import * as selectors from './selectors';

describe('modal state', () => {
    let dispatch, getState, mockModal;

    /**
     * Executes validation for no modal being configured to be shown.
     *
     * @private
     * @returns {void}
     */
    function verifyNoModal() {
        const state = getState();

        expect(selectors.getCurrentModal(state)).toEqual({
            modal: null,
            modalProps: null
        });
        expect(selectors.isAnyModalOpen(state)).toBe(false);
        expect(selectors.isModalOpen(state, mockModal)).toBe(false);
    }

    beforeEach(() => {
        mockModal = jest.fn();
        ({ dispatch, getState } = createStore(combineReducers({ modal: modalReducer })));
    });

    it('by default has no modal', () => {
        verifyNoModal();
    });

    describe('showing modals', () => {
        it('sets the modal component to display with its props', () => {
            const mockProps = {
                anyPropKey: 'any-prop-value'
            };

            dispatch(actions.showModal(mockModal, mockProps));

            const state = getState();

            expect(selectors.getCurrentModal(state)).toEqual({
                modal: mockModal,
                modalProps: mockProps
            });
            expect(selectors.isModalOpen(state, mockModal)).toBe(true);
            expect(selectors.isAnyModalOpen(state)).toBe(true);
        });
    });

    describe('hiding modals', () => {
        beforeEach(() => {
            dispatch(actions.showModal(mockModal));
        });

        it('resets state', () => {
            dispatch(actions.hideModal());
            verifyNoModal();
        });

        it('occurs on route change', () => {
            dispatch(routeChanged());
            verifyNoModal();
        });
    });
});
