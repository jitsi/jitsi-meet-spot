import { mount } from 'enzyme';
import React from 'react';

import { mockT } from 'common/test-mocks';

import { PairRemote } from './PairRemote';

describe('PairRemote', () => {
    const MOCK_PAIR_CODE = '12345678';

    let onSuccessSpy, pairRemote;

    beforeEach(() => {
        onSuccessSpy = jest.fn();

        pairRemote = mount(
            <PairRemote
                code = { MOCK_PAIR_CODE }
                onSuccess = { onSuccessSpy }
                permanentRemotesCount = { 0 }
                t = { mockT } />
        );
    });

    it('proceeds automatically when a remote is paired', () => {
        expect(onSuccessSpy).not.toHaveBeenCalled();

        pairRemote.setProps({ permanentRemotesCount: 1 });

        expect(onSuccessSpy).toHaveBeenCalled();
    });
});
