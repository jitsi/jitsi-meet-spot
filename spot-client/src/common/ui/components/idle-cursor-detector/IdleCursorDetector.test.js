import { shallow } from 'enzyme';
import React from 'react';

import IdleCursorDetector from './IdleCursorDetector';

describe('IdleCursorDetector', () => {
    const TIME_LIMIT = 100;
    let idleCursorDetector, listenerMap, onChangeSpy;

    beforeEach(() => {
        jest.useFakeTimers();

        listenerMap = {};

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((event, callback) => {
                listenerMap[event] = callback;
            });
        jest.spyOn(window, 'removeEventListener')
            .mockImplementation(event => {
                listenerMap[event] = jest.fn();
            });

        onChangeSpy = jest.fn();
        idleCursorDetector = shallow(
            <IdleCursorDetector
                onCursorIdleChange = { onChangeSpy }
                timeLimit = { TIME_LIMIT } />
        );
    });

    it('assumes mouse starts as inactive', () => {
        jest.advanceTimersByTime(TIME_LIMIT);
        expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('notifies when the cursor becomes active', () => {
        listenerMap.mousemove();
        expect(onChangeSpy).toHaveBeenCalledWith(false);
    });

    it('notifies when the cursor becomes inactive again', () => {
        listenerMap.mousemove();
        jest.advanceTimersByTime(TIME_LIMIT);
        expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it('does not notify of activity change after unmount', () => {
        idleCursorDetector.unmount();
        listenerMap.mousemove();
        expect(onChangeSpy).not.toHaveBeenCalled();
    });
});
