import { act, fireEvent, render } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
jest.mock('spot-tv/app-state');
import { fetchExitPassword } from 'spot-tv/app-state';

import { ExitVerification } from './ExitVerification';

const SELECT_EXIT_CONFIRMATION = '[data-qa-id="exit-electron-confirmation"]';
const SELECT_LOADING_SCREEN = '[data-qa-id="exit-electron-loading"]';
const SELECT_PASSWORD_PROMPT = '[data-qa-id="exit-electron-password-prompt"]';

const SELECT_PASSWORD_INPUT = '[data-qa-id="exit-electron-password-input"]';

const SELECT_CANCEL_BUTTON = '[data-qa-id="exit-electron-cancel"]';
const SELECT_CONFIRM_BUTTON = '[data-qa-id="exit-electron-confirm"]';

describe('ExitVerification', () => {
    let container: HTMLElement;
    let onCancel: jest.Mock;
    let onPasswordInvalid: jest.Mock;
    let onVerification: jest.Mock;
    let store: any;

    beforeEach(() => {
        store = createStore((state = { config: {} }) => state);
        onCancel = jest.fn();
        onPasswordInvalid = jest.fn();
        onVerification = jest.fn();
    });

    const mountExitComponent = () => {
        ({ container } = render(
            <Provider store = { store }>
                <ExitVerification
                    onCancel = { onCancel }
                    onPasswordInvalid = { onPasswordInvalid }
                    onVerification = { onVerification }
                    t = { mockT } />
            </Provider>
        ));
    };

    const selectConfirmButton = () => container.querySelector(SELECT_CONFIRM_BUTTON) as HTMLElement;
    const selectCancelButton = () => container.querySelector(SELECT_CANCEL_BUTTON) as HTMLElement;

    describe('displays the exit confirmation if there is no password', () => {
        let returnExitPassword: Promise<undefined>;

        beforeEach(async () => {
            returnExitPassword = Promise.resolve(undefined);

            (fetchExitPassword as jest.Mock).mockReturnValue(returnExitPassword);

            mountExitComponent();

            expect(fetchExitPassword).toHaveBeenCalled();

            // wait for componentDidMount's fetchExitPassword and the resulting setState
            await act(async () => {
                await returnExitPassword;
            });

            expect(container.querySelector(SELECT_EXIT_CONFIRMATION)).toBeInTheDocument();
        });
        it('and calls onVerified when the confirm button is clicked', () => {
            const button = selectConfirmButton();

            fireEvent.click(button);

            expect(onCancel).not.toHaveBeenCalled();
            expect(onVerification).toHaveBeenCalled();
        });
        it('and calls onCancel when the cancel button is clicked', () => {
            const button = selectCancelButton();

            fireEvent.click(button);

            expect(onVerification).not.toHaveBeenCalled();
            expect(onCancel).toHaveBeenCalled();
        });
    });
    it('displays the loading view if fetch exit password takes time', async () => {
        jest.useFakeTimers();

        const returnExitPassword = new Promise(resolve => {
            setTimeout(() => resolve(undefined), 30000);
        });

        (fetchExitPassword as jest.Mock).mockReturnValue(returnExitPassword);

        mountExitComponent();

        act(() => {
            jest.runAllTimers();
        });

        expect(container.querySelector(SELECT_LOADING_SCREEN)).toBeInTheDocument();

        await act(async () => {
            await returnExitPassword;
        });

        expect(container.querySelector(SELECT_LOADING_SCREEN)).toBeNull();
    });
    it('displays the password prompt and does the verification', async () => {
        const TEST_PASSWORD = '12345';
        const returnExitPassword = Promise.resolve(TEST_PASSWORD);

        (fetchExitPassword as jest.Mock).mockReturnValue(returnExitPassword);

        mountExitComponent();

        await act(async () => {
            await returnExitPassword;
        });

        expect(container.querySelector(SELECT_PASSWORD_PROMPT)).toBeInTheDocument();

        const input = container.querySelector(SELECT_PASSWORD_INPUT) as HTMLInputElement;

        fireEvent.change(input, { target: { value: `${TEST_PASSWORD}1234` } });

        const button = selectConfirmButton();

        fireEvent.click(button);

        expect(onVerification).not.toHaveBeenCalled();
        expect(onPasswordInvalid).toHaveBeenCalled();

        fireEvent.change(input, { target: { value: TEST_PASSWORD } });

        fireEvent.click(button);

        expect(onVerification).toHaveBeenCalled();
    });
});
