import React from 'react';
import { shallow } from 'enzyme';

import { ModalManager } from './ModalManager';

describe('ModalManager', () => {
    let mockModal, modalManager;

    beforeEach(() => {
        mockModal = jest.fn().mockReturnValue(<>test modal</>);
        modalManager = shallow(<ModalManager />);
    });

    it('hides itself if there is no modal to display', () => {
        expect(modalManager.isEmptyRender()).toEqual(true);
    });

    it('displays the modal', () => {
        modalManager.setProps({ modal: mockModal });

        expect(modalManager.exists(mockModal)).toBe(true);
    });

    it('passes props to the modal', () => {
        const modalProps = { someProps: 'value' };

        modalManager.setProps({
            modal: mockModal,
            modalProps
        });

        expect(modalManager.find(mockModal).props()).toEqual(modalProps);
    });
});
