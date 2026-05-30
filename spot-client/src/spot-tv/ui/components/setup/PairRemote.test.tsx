import { mockT } from 'common/test-mocks';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';


import { PairRemote } from './PairRemote';

describe('PairRemote', () => {
    const MOCK_PAIR_CODE = '12345678';

    let onSuccessSpy: jest.Mock;
    let pairRemote: ReactWrapper;

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
