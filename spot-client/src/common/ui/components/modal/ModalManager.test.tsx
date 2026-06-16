import { render, screen } from '@testing-library/react';
import React from 'react';

import { ModalManager } from './ModalManager';

describe('ModalManager', () => {
    let mockModal: jest.Mock;

    beforeEach(() => {
        mockModal = jest.fn().mockReturnValue(<>test modal</>);
    });

    it('hides itself if there is no modal to display', () => {
        const { container } = render(<ModalManager />);

        expect(container).toBeEmptyDOMElement();
    });

    it('displays the modal', () => {
        render(<ModalManager modal = { mockModal } />);

        expect(screen.getByText('test modal')).toBeInTheDocument();
    });

    it('passes props to the modal', () => {
        const modalProps = { someProps: 'value' };

        render(
            <ModalManager
                modal = { mockModal }
                modalProps = { modalProps } />
        );

        expect(mockModal).toHaveBeenCalledWith(modalProps, undefined);
    });
});
