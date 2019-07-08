import { mount } from 'enzyme';
import React from 'react';

import { KickedOverlay } from './KickedOverlay';

describe('KickedOverlay', () => {
    it('invokes the callback after countdown completes', () => {
        jest.useFakeTimers();

        const callback = jest.fn();

        mount(<KickedOverlay onRedirect = { callback } />);

        jest.runAllTimers();

        expect(callback).toHaveBeenCalled();
    });
});
