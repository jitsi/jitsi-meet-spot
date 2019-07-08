import { shallow } from 'enzyme';
import React from 'react';

import { StatusOverlay } from './StatusOverlay';

describe('StatusOverlay', () => {
    const TEST_TITLE = 'test-title';
    let statusOverlay;

    it('renders the passed in title', () => {
        statusOverlay = shallow(<StatusOverlay title = { TEST_TITLE } />);

        expect(statusOverlay.text()).toBe(TEST_TITLE);
    });

    it('renders the passed in children', () => {
        const children = [
            <div key = '1'>test</div>,
            <div key = '2'>test2</div>
        ];

        statusOverlay = shallow(
            <StatusOverlay title = { TEST_TITLE }>
                { children }
            </StatusOverlay>
        );

        expect(statusOverlay.find('.status-overlay-text').children().length)
            .toBe(children.length);
    });
});
