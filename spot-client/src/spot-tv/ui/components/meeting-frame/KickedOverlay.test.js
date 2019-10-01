import { mount } from 'enzyme';
import React from 'react';

import { mockT } from 'common/test-mocks';

import { KickedOverlay } from './KickedOverlay';

describe('KickedOverlay', () => {
    it('invokes the callback after countdown completes', () => {
        jest.useFakeTimers();

        const callback = jest.fn();

        mount(
            <KickedOverlay
                onRedirect = { callback }
                t = { mockT } />
        );

        jest.runAllTimers();

        expect(callback).toHaveBeenCalled();
    });
});
