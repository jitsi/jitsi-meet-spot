import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Modal from './Modal';

describe('Modal', () => {
    let Child: jest.Mock;
    let container: HTMLElement;
    let onCloseSpy: jest.Mock;

    beforeEach(() => {
        Child = jest.fn().mockReturnValue(<>test</>);
        onCloseSpy = jest.fn();

        ({ container } = render(
            <Modal onClose = { onCloseSpy }>
                <Child />
            </Modal>
        ));
    });

    it('triggers the close callback', () => {
        fireEvent.click(container.querySelector('[data-qa-id="modal-close"]')!);

        expect(onCloseSpy).toHaveBeenCalled();
    });

    it('displays children', () => {
        expect(Child).toHaveBeenCalled();
        expect(screen.getByText('test')).toBeInTheDocument();
    });
});
