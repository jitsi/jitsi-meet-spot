import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { mockT } from 'common/test-mocks';

import { KickedOverlay } from './KickedOverlay';

describe('KickedOverlay', () => {
    it('invokes the callback after countdown completes', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const store = createStore((state = { config: {} }) => state);

        mount(
            <Provider store = { store }>
                <KickedOverlay
                    onRedirect = { callback }
                    t = { mockT } />
            </Provider>
        );

        jest.runAllTimers();

        expect(callback).toHaveBeenCalled();
    });
});
