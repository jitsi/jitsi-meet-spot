import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { RaiseHandButton } from './RaiseHandButton';

describe('RaiseHandButton', () => {
    let setRaiseHandCallback: jest.Mock;
    let rerender: (ui: React.ReactElement) => void;

    beforeEach(() => {
        setRaiseHandCallback = jest.fn();

        ({ rerender } = render(
            <RaiseHandButton
                handRaised = { false }
                onSetRaiseHand = { setRaiseHandCallback } />
        ));
    });

    describe('when hand is not raised', () => {
        it('displays UI showing hand not raised', () => {
            // Assuming PanToolTwoTone is the icon for hand not raised
            expect(screen.queryAllByTestId('PanToolOutlinedIcon')).toHaveLength(1);
        });

        it('notifies of raise hand action', () => {
            fireEvent.click(screen.getByRole('button'));
            expect(setRaiseHandCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state correctly when hand is not raised and action is pending', () => {
            rerender(
                <RaiseHandButton
                    changePending = { true }
                    handRaised = { false }
                    onSetRaiseHand = { setRaiseHandCallback } />
            );

            // Assuming PanToolTwoTone is the icon for hand not raised
            expect(screen.queryAllByTestId('PanToolOutlinedIcon')).toHaveLength(1);
        });
    });

    describe('when hand is raised', () => {
        beforeEach(() => {
            rerender(
                <RaiseHandButton
                    handRaised = { true }
                    onSetRaiseHand = { setRaiseHandCallback } />
            );
        });

        it('displays UI showing hand raised', () => {
            expect(screen.queryAllByTestId('PanToolOutlinedIcon')).toHaveLength(1);
        });

        it('notifies of lower hand action', () => {
            fireEvent.click(screen.getByRole('button'));
            expect(setRaiseHandCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state correctly when hand is raised and action is pending', () => {
            rerender(
                <RaiseHandButton
                    changePending = { true }
                    handRaised = { true }
                    onSetRaiseHand = { setRaiseHandCallback } />
            );

            expect(screen.queryAllByTestId('PanToolOutlinedIcon')).toHaveLength(1);
        });
    });
});
