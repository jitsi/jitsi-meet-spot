import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { StatusOverlay } from './StatusOverlay';

describe('StatusOverlay', () => {
    const TEST_TITLE = 'test-title';

    const store = createStore((state = { config: {} }) => state);

    it('renders the passed in title', () => {
        const { container } = render(
            <Provider store = { store }>
                <StatusOverlay title = { TEST_TITLE } />
            </Provider>
        );

        expect(container.textContent).toBe(TEST_TITLE);
    });

    it('renders the passed in children', () => {
        const children = [
            <div key = '1'>test</div>,
            <div key = '2'>test2</div>
        ];

        const { container } = render(
            <Provider store = { store }>
                <StatusOverlay title = { TEST_TITLE }>
                    { children }
                </StatusOverlay>
            </Provider>
        );

        expect(container.querySelector('.status-overlay-text')?.children.length)
            .toBe(children.length);
    });
});
