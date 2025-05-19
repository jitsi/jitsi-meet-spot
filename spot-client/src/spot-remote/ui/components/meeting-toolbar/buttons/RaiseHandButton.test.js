import { PanToolOutlined } from 'common/icons'; // Assuming PanToolTwoTone for not raised, adjust if needed
import { mockT } from 'common/test-mocks';
import { mount } from 'enzyme';
import React from 'react';

import { RaiseHandButton } from './RaiseHandButton';

describe('RaiseHandButton', () => {
    let setRaiseHandCallback;
    let raiseHandButton;

    beforeEach(() => {
        setRaiseHandCallback = jest.fn();

        raiseHandButton = mount(
            <RaiseHandButton
                handRaised = { false }
                onSetRaiseHand = { setRaiseHandCallback }
                t = { mockT } />
        );
    });

    afterEach(() => {
        raiseHandButton.unmount();
    });

    describe('when hand is not raised', () => {
        it('displays UI showing hand not raised', () => {
            // Assuming PanToolTwoTone is the icon for hand not raised
            expect(raiseHandButton.find(PanToolOutlined).length).toBe(1);
        });

        it('notifies of raise hand action', () => {
            raiseHandButton.find('button').simulate('click');
            expect(setRaiseHandCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state correctly when hand is not raised and action is pending', () => {
            raiseHandButton.setProps({ changePending: true });

            // Assuming PanToolTwoTone is the icon for hand not raised
            expect(raiseHandButton.find(PanToolOutlined).length).toBe(1);
        });
    });

    describe('when hand is raised', () => {
        beforeEach(() => {
            raiseHandButton.setProps({ handRaised: true });
        });

        it('displays UI showing hand raised', () => {
            expect(raiseHandButton.find(PanToolOutlined).length).toBe(1);
        });

        it('notifies of lower hand action', () => {
            raiseHandButton.find('button').simulate('click');
            expect(setRaiseHandCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state correctly when hand is raised and action is pending', () => {
            raiseHandButton.setProps({ changePending: true });
            expect(raiseHandButton.find(PanToolOutlined).length).toBe(1);
        });
    });
});
