import { act, render } from '@testing-library/react';
import React from 'react';

import IdleCursorDetector from './IdleCursorDetector';

describe('IdleCursorDetector', () => {
    const TIME_LIMIT = 100;

    let unmount: () => void;
    let listenerMap: { [event: string]: (...args: any[]) => void };
    let onChangeSpy: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();

        listenerMap = {};

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((event: string, callback: any) => {
                listenerMap[event] = callback;
            });
        jest.spyOn(window, 'removeEventListener')
            .mockImplementation((event: string) => {
                listenerMap[event] = jest.fn();
            });

        onChangeSpy = jest.fn();
        ({ unmount } = render(
            <IdleCursorDetector
                onCursorIdleChange = { onChangeSpy }
                timeLimit = { TIME_LIMIT } />
        ));
    });

    it('assumes mouse starts as inactive', () => {
        act(() => {
            jest.advanceTimersByTime(TIME_LIMIT);
        });
        expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('notifies when the cursor becomes active', () => {
        listenerMap.mousemove();
        expect(onChangeSpy).toHaveBeenCalledWith(false);
    });

    it('notifies when the cursor becomes inactive again', () => {
        listenerMap.mousemove();
        act(() => {
            jest.advanceTimersByTime(TIME_LIMIT);
        });
        expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it('does not notify of activity change after unmount', () => {
        unmount();
        listenerMap.mousemove();
        expect(onChangeSpy).not.toHaveBeenCalled();
    });
});
