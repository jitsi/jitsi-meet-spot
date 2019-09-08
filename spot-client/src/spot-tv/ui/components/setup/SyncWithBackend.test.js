import { mount } from 'enzyme';
import React from 'react';

import { mockT } from 'common/test-mocks';
import { LoadingIcon } from 'common/ui';

import { SyncWithBackend } from './SyncWithBackend';

describe('SyncWithBackend', () => {
    const MOCK_JOIN_CODE = '12345678';
    let onAttemptSyncSpy, onSuccessSpy, onSyncErrorSpy, syncWithBackend;

    beforeEach(() => {
        onAttemptSyncSpy = jest.fn();
        onSuccessSpy = jest.fn();
        onSyncErrorSpy = jest.fn();

        syncWithBackend = mount(
            <SyncWithBackend
                onAttemptSync = { onAttemptSyncSpy }
                onSuccess = { onSuccessSpy }
                onSyncError = { onSyncErrorSpy }
                t = { mockT } />
        );
    });

    /**
     * Helper to enter a join code.
     *
     * @param {string} joinCode - The join code which should be entered.
     * @private
     * @returns {void}
     */
    function setValue(joinCode) {
        const input = syncWithBackend.find('textarea');

        input.at(0).instance().value = joinCode;
        input.simulate('change');
    }

    it('shows a loading icon', () => {
        onAttemptSyncSpy.mockImplementation(() => new Promise());

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
