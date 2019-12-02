import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { mockT } from 'common/test-mocks';

jest.mock('spot-tv/app-state');
import { fetchExitPassword } from 'spot-tv/app-state';

import { ExitVerification } from './ExitVerification';


const SELECT_EXIT_CONFIRMATION = { 'data-qa-id': 'exit-electron-confirmation' };
const SELECT_LOADING_SCREEN = { 'data-qa-id': 'exit-electron-loading' };
const SELECT_PASSWORD_PROMPT = { 'data-qa-id': 'exit-electron-password-prompt' };

const SELECT_PASSWORD_INPUT = { 'data-qa-id': 'exit-electron-password-input' };

const SELECT_CANCEL_BUTTON = { 'data-qa-id': 'exit-electron-cancel' };
const SELECT_CONFIRM_BUTTON = { 'data-qa-id': 'exit-electron-confirm' };

describe('ExitVerification', () => {
    let exitComponent, onCancel, onPasswordInvalid, onVerification, store;

    beforeEach(() => {
        store = createStore((state = { config: {} }) => state);
        onCancel = jest.fn();
        onPasswordInvalid = jest.fn();
        onVerification = jest.fn();
    });

    const mountExitComponent = () => {
        exitComponent = mount(
            <Provider store = { store }>
                <ExitVerification
                    onCancel = { onCancel }
                    onPasswordInvalid = { onPasswordInvalid }
                    onVerification = { onVerification }
                    t = { mockT } />
            </Provider>
        );
    };

    const selectConfirmButton = () => exitComponent.find(SELECT_CONFIRM_BUTTON).first();
    const selectCancelButton = () => exitComponent.find(SELECT_CANCEL_BUTTON).first();

    describe('displays the exit confirmation if there is no password', () => {
        let returnExitPassword;

        beforeEach(() => {
            returnExitPassword = Promise.resolve(undefined);

            fetchExitPassword.mockReturnValue(returnExitPassword);

            mountExitComponent();

            expect(fetchExitPassword).toHaveBeenCalled();

            // need to do .update() after componentDidMount called fetchExitPassword and the setState
            return returnExitPassword.then(() => {
                exitComponent.update();

                expect(exitComponent.exists(SELECT_EXIT_CONFIRMATION)).toEqual(true);
            });
        });
        it('and calls onVerified when the confirm button is clicked', () => {
            selectConfirmButton().simulate('click');

            expect(onCancel).not.toHaveBeenCalled();
            expect(onVerification).toHaveBeenCalled();
        });
        it('and calls onCancel when the cancel button is clicked', () => {
            selectCancelButton().simulate('click');

            expect(onVerification).not.toHaveBeenCalled();
            expect(onCancel).toHaveBeenCalled();
        });
    });
    it('displays the loading view if fetch exit password takes time', () => {
        jest.useFakeTimers();

        const returnExitPassword = new Promise(resolve => {
            setTimeout(() => resolve(undefined), 30000);
        });

        fetchExitPassword.mockReturnValue(returnExitPassword);

        mountExitComponent();

        jest.runAllTimers();

        expect(exitComponent.exists(SELECT_LOADING_SCREEN)).toEqual(true);

        return returnExitPassword.then(() => {
            exitComponent.update();

            expect(exitComponent.exists(SELECT_LOADING_SCREEN)).toEqual(false);
        });
    });
    it('displays the password prompt and does the verification', () => {
        const TEST_PASSWORD = '12345';
        const returnExitPassword = Promise.resolve(TEST_PASSWORD);

        fetchExitPassword.mockReturnValue(returnExitPassword);

        mountExitComponent();

        return returnExitPassword.then(() => {
            exitComponent.update();

            expect(exitComponent.exists(SELECT_PASSWORD_PROMPT)).toEqual(true);

            exitComponent.find(SELECT_PASSWORD_INPUT)
                .simulate('change', { target: { value: `${TEST_PASSWORD}1234` } });

            selectConfirmButton().simulate('click');

            expect(onVerification).not.toHaveBeenCalled();
            expect(onPasswordInvalid).toHaveBeenCalled();

            exitComponent.find(SELECT_PASSWORD_INPUT)
                .simulate('change', { target: { value: TEST_PASSWORD } });

            selectConfirmButton().simulate('click');

            expect(onVerification).toHaveBeenCalled();
        });
    });
});
