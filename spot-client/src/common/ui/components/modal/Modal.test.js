import { shallow } from 'enzyme';
import React from 'react';

import Modal from './Modal';

describe('Modal', () => {
    let Child, modal, onCloseSpy;

    beforeEach(() => {
        Child = jest.fn().mockReturnValue(<>test</>);
        onCloseSpy = jest.fn();

        modal = shallow(
            <Modal onClose = { onCloseSpy }>
                <Child />
            </Modal>
        );
    });

    it('triggers the close callback', () => {
        modal.find('[data-qa-id="modal-close"]').simulate('click');

        expect(onCloseSpy).toHaveBeenCalled();
    });

    it('displays children', () => {
        expect(modal.exists(Child)).toBe(true);
    });
});
