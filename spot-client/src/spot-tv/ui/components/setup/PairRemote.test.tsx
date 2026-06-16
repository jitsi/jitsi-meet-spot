import { render } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';


import { PairRemote } from './PairRemote';

describe('PairRemote', () => {
    const MOCK_PAIR_CODE = '12345678';

    let onSuccessSpy: jest.Mock;
    let rerender: (ui: React.ReactElement) => void;

    beforeEach(() => {
        onSuccessSpy = jest.fn();

        ({ rerender } = render(
            <PairRemote
                code = { MOCK_PAIR_CODE }
                isPairingComplete = { false }
                onSuccess = { onSuccessSpy }
                t = { mockT } />
        ));
    });

    it('proceeds automatically when a remote is paired', () => {
        expect(onSuccessSpy).not.toHaveBeenCalled();

        rerender(
            <PairRemote
                code = { MOCK_PAIR_CODE }
                isPairingComplete = { true }
                onSuccess = { onSuccessSpy }
                t = { mockT } />
        );

        expect(onSuccessSpy).toHaveBeenCalled();
    });
});
