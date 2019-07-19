import { ROUTE_CHANGED } from '../route/actionTypes';

import modalReducer from './reducer';
import * as types from './actionTypes';

describe('modal reducer', () => {
    const expectedDefaultState = {
        modal: null,
        modalProps: null
    };
    const stateWithModal = {
        modal: jest.fn(),
        modalProps: { key: 'value' }
    };

    it('returns a default state', () => {
        expect(modalReducer(undefined, {})).toEqual(expectedDefaultState);
    });

    describe('showing modals', () => {
        it('sets the modal component to display with its props', () => {
            expect(modalReducer(expectedDefaultState, {
                type: types.MODAL_SHOW,
                ...stateWithModal
            })).toEqual(stateWithModal);
        });
    });

    describe('hiding modals', () => {
        it('resets state', () => {
            expect(modalReducer(stateWithModal, { type: types.MODAL_HIDE }))
                .toEqual(expectedDefaultState);
        });

        it('occurs on route change', () => {
            expect(modalReducer(stateWithModal, { type: ROUTE_CHANGED }))
                .toEqual(expectedDefaultState);
        });
    });
});
