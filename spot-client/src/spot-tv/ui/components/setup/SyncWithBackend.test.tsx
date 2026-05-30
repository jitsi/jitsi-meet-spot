import { mockT } from 'common/test-mocks';
import { LoadingIcon } from 'common/ui';
import { ReactWrapper, mount } from 'enzyme';
import React from 'react';


import { SyncWithBackend } from './SyncWithBackend';

describe('SyncWithBackend', () => {
    const MOCK_JOIN_CODE = '12345678';

    let onAttemptSyncSpy: jest.Mock;
    let onSuccessSpy: jest.Mock;
    let onSyncErrorSpy: jest.Mock;
    let syncWithBackend: ReactWrapper;

    beforeEach(() => {
        onAttemptSyncSpy = jest.fn();
        onSuccessSpy = jest.fn();
        onSyncErrorSpy = jest.fn();

        syncWithBackend = mount(
            <SyncWithBackend
                onAttemptSync = { onAttemptSyncSpy }
                onStartAutoSync = { jest.fn() }
                onSuccess = { onSuccessSpy }
                onSyncError = { onSyncErrorSpy }
                t = { mockT } />
        );
    });

    /**
     * Helper to enter a join code.
     *
     * @param joinCode - The join code which should be entered.
     * @private
     * @returns {void}
     */
    function setValue(joinCode: string) {
        const input = syncWithBackend.find('textarea');

        (input.at(0).instance() as unknown as HTMLTextAreaElement).value = joinCode;
        input.simulate('change');
    }

    it('shows a loading icon', () => {
        onAttemptSyncSpy.mockImplementation(() => Promise.resolve());

        expect(syncWithBackend.find(LoadingIcon).length).toBe(0);

        setValue(MOCK_JOIN_CODE);

        expect(syncWithBackend.find(LoadingIcon).length).toBe(1);
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
