import { fireEvent, render } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';


import { SyncWithBackend } from './SyncWithBackend';

describe('SyncWithBackend', () => {
    const MOCK_JOIN_CODE = '12345678';

    let onAttemptSyncSpy: jest.Mock;
    let onSuccessSpy: jest.Mock;
    let onSyncErrorSpy: jest.Mock;
    let container: HTMLElement;

    beforeEach(() => {
        onAttemptSyncSpy = jest.fn();
        onSuccessSpy = jest.fn();
        onSyncErrorSpy = jest.fn();

        ({ container } = render(
            <SyncWithBackend
                onAttemptSync = { onAttemptSyncSpy }
                onStartAutoSync = { jest.fn() }
                onSuccess = { onSuccessSpy }
                onSyncError = { onSyncErrorSpy }
                t = { mockT } />
        ));
    });

    /**
     * Helper to enter a join code.
     *
     * @param joinCode - The join code which should be entered.
     * @private
     * @returns {void}
     */
    function setValue(joinCode: string) {
        const input = container.querySelector('textarea') as HTMLTextAreaElement;

        fireEvent.change(input, { target: { value: joinCode } });
    }

    it('shows a loading icon', () => {
        onAttemptSyncSpy.mockImplementation(() => Promise.resolve());

        expect(container.querySelectorAll('.loading-icon')).toHaveLength(0);

        setValue(MOCK_JOIN_CODE);

        expect(container.querySelectorAll('.loading-icon')).toHaveLength(1);
    });

    it('calls the success callback', () => {
        onAttemptSyncSpy.mockImplementation(() => Promise.resolve());

        setValue(MOCK_JOIN_CODE);

        const runSyncPromise = new Promise(resolve => process.nextTick(resolve));

        return runSyncPromise
            .then(() => expect(onSuccessSpy).toHaveBeenCalled());
    });

    it('calls the error callback', () => {
        onAttemptSyncSpy.mockImplementation(() => Promise.reject());

        setValue(MOCK_JOIN_CODE);

        const runSyncPromise = new Promise(resolve => process.nextTick(resolve));

        return runSyncPromise
            .then(() => expect(onSyncErrorSpy).toHaveBeenCalled());
    });
});
