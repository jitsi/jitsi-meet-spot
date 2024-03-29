import { expect, jest } from '@jest/globals';
import * as detection from 'common/detection';
import { mockT } from 'common/test-mocks';
import { mount } from 'enzyme';
import React from 'react';


import { JoinCodeEntry } from './join-code-entry';

jest.mock('common/detection', () => {
    return {
        isAutoFocusSupported: jest.fn(),
        isElectron: jest.fn(),
        isSpotControllerApp: jest.fn()
    };
});

jest.mock('common/ui', () => {
    const realCommonUi = jest.requireActual('common/ui');

    return {
        ...realCommonUi,
        View: jest.fn(props => <>{ props.children }</>)
    };
});

describe('JoinCodeEntry', () => {
    let historyMock,
        locationMock,
        onDisconnectSpy,
        sendJoinCodeNeededSpy,
        updateReadyStatusSpy;

    beforeEach(() => {
        historyMock = {
            push: jest.fn()
        };
        locationMock = {
            pathname: '/'
        };
        onDisconnectSpy = jest.fn();
        sendJoinCodeNeededSpy = jest.fn();
        updateReadyStatusSpy = jest.fn();
    });

    /**
     * Mounts the {@code JoinCodeEntry} component with mocks as props.
     *
     * @param {Object} propOverrides - Props to pass in.
     * @private
     * @returns {void}
     */
    function mountWithMocks(propOverrides = {}) {
        const props = {
            history: historyMock,
            location: locationMock,
            onDisconnect: onDisconnectSpy,
            sendJoinCodeNeeded: sendJoinCodeNeededSpy,
            t: mockT,
            updateReadyStatus: updateReadyStatusSpy,
            ...propOverrides
        };

        mount(<JoinCodeEntry { ...props } />);
    }

    describe('onboarding', () => {
        it('is redirect to if spot-controller and not completed yet', () => {
            jest.spyOn(detection, 'isSpotControllerApp').mockReturnValue(true);

            mountWithMocks();

            expect(historyMock.push).toHaveBeenCalledWith('/help');
        });

        it('is not redirect if already completed', () => {
            jest.spyOn(detection, 'isSpotControllerApp').mockReturnValue(true);

            mountWithMocks({ completedOnboarding: true });
            expect(historyMock.push).not.toHaveBeenCalled();
        });

        it('is not redirect if not spot-controller', () => {
            expect(historyMock.push).not.toHaveBeenCalled();
        });
    });
});
