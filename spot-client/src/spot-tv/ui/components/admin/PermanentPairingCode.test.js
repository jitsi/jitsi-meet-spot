
import { mockT } from 'common/test-mocks';
import { LoadingIcon } from 'common/ui';
import { mount } from 'enzyme';
import React from 'react';

import { PermanentPairingCode } from './PermanentPairingCode';

describe('PermanentPairingCode', () => {
    const TEST_PAIRING_CODE = '123456';

    let permanentPairingCode, refreshPairingCodeSpy;

    beforeEach(() => {
        refreshPairingCodeSpy = jest.fn().mockReturnValue(Promise.resolve());

        permanentPairingCode = mount(
            <PermanentPairingCode
                pairingCode = { TEST_PAIRING_CODE }
                refreshPairingCode = { refreshPairingCodeSpy }
                t = { mockT } />
        );
    });

    afterEach(() => {
        permanentPairingCode.unmount();
    });

    describe('on click', () => {
        it('displays a loading icon', () => {
            permanentPairingCode.find('button').simulate('click');

            expect(permanentPairingCode.find(LoadingIcon).length).toBe(1);
        });

        it('calls to refresh the code', () => {
            permanentPairingCode.find('button').simulate('click');

            const refreshCompletePromise = new Promise(resolve => process.nextTick(resolve));

            return refreshCompletePromise
                .then(() => expect(refreshPairingCodeSpy).toHaveBeenCalled());
        });

        it('displays the code', () => {
            refreshPairingCodeSpy.mockReturnValue(Promise.resolve());

            permanentPairingCode.find('button').simulate('click');

            const refreshCompletePromise = new Promise(resolve => process.nextTick(resolve));

            return refreshCompletePromise
                .then(() => {
                    permanentPairingCode.update();

                    expect(permanentPairingCode.find('.pairing-code').text())
                        .toEqual(TEST_PAIRING_CODE);
                });
        });
    });
});
