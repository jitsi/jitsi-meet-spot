import { mockT } from 'common/test-mocks';
import { mount } from 'enzyme';
import React from 'react';


import { PairRemote } from './PairRemote';

describe('PairRemote', () => {
    const MOCK_PAIR_CODE = '12345678';

    let onSuccessSpy, pairRemote;

    beforeEach(() => {
        onSuccessSpy = jest.fn();

        pairRemote = mount(
            <PairRemote
                code = { MOCK_PAIR_CODE }
                isPairingComplete = { false }
                onSuccess = { onSuccessSpy }
                t = { mockT } />
        );
    });

    it('proceeds automatically when a remote is paired', () => {
        expect(onSuccessSpy).not.toHaveBeenCalled();

        pairRemote.setProps({ isPairingComplete: true });

        expect(onSuccessSpy).toHaveBeenCalled();
    });
});
