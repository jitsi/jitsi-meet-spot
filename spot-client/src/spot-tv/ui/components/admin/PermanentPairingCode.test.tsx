
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';

import { PermanentPairingCode } from './PermanentPairingCode';

describe('PermanentPairingCode', () => {
    const TEST_PAIRING_CODE = '123456';

    let container: HTMLElement;
    let refreshPairingCodeSpy: jest.Mock;

    beforeEach(() => {
        refreshPairingCodeSpy = jest.fn().mockReturnValue(Promise.resolve());

        ({ container } = render(
            <PermanentPairingCode
                pairingCode = { TEST_PAIRING_CODE }
                refreshPairingCode = { refreshPairingCodeSpy }
                t = { mockT } />
        ));
    });

    describe('on click', () => {
        it('displays a loading icon', async () => {
            fireEvent.click(container.querySelector('button')!);

            expect(container.querySelectorAll('.loading-icon')).toHaveLength(1);

            // Flush the pending state update from the resolved refresh promise
            // so it does not leak past the end of the test.
            await act(async () => {
                await Promise.resolve();
            });
        });

        it('calls to refresh the code', () => {
            fireEvent.click(container.querySelector('button')!);

            return waitFor(() => expect(refreshPairingCodeSpy).toHaveBeenCalled());
        });

        it('displays the code', () => {
            refreshPairingCodeSpy.mockReturnValue(Promise.resolve());

            fireEvent.click(container.querySelector('button')!);

            return waitFor(() => {
                expect(container.querySelector('.pairing-code')!.textContent)
                    .toEqual(TEST_PAIRING_CODE);
            });
        });
    });
});
