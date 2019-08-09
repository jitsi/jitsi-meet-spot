import { persistence } from 'common/utils';
import { getPersistedState } from './store-persistence';

describe('store-persistence', () => {
    const SPOT_TV_PERM_CODE = '123456';
    const SPOT_REMOTE_PERM_CODE = '654321';
    const COMMON_BACKEND_PERM_CODE = '12345678';

    describe('restores legacy pairing code', () => {
        it('when both remote and tv keys are present', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    'spot-tv/backend': {
                        permanentPairingCode: SPOT_TV_PERM_CODE
                    },
                    spotRemote: {
                        permanentPairingCode: SPOT_REMOTE_PERM_CODE
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: SPOT_TV_PERM_CODE
                }
            });
        });
        it('when only Spot TV code is present', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    'spot-tv/backend': {
                        permanentPairingCode: SPOT_TV_PERM_CODE
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: SPOT_TV_PERM_CODE
                }
            });
        });
        it('when only Spot Remote key is present', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    spotRemote: {
                        permanentPairingCode: SPOT_REMOTE_PERM_CODE
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: SPOT_REMOTE_PERM_CODE
                }
            });
        });
        it('return falsy and does not crash when nothing is present', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({ });

            expect(getPersistedState()).toEqual({ });
        });
    });
    describe('ignores legacy pairing codes', () => {
        it('when common/backend code was stored', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    backend: {
                        permanentPairingCode: COMMON_BACKEND_PERM_CODE
                    },
                    'spot-tv/backend': {
                        permanentPairingCode: SPOT_TV_PERM_CODE
                    },
                    spotRemote: {
                        permanentPairingCode: SPOT_REMOTE_PERM_CODE
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: COMMON_BACKEND_PERM_CODE
                }
            });
        });
        it('when tv/remote codes are not correctly defined', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    backend: {
                        permanentPairingCode: COMMON_BACKEND_PERM_CODE
                    },
                    'spot-tv/backend': {
                        permanentPairingCode: null
                    },
                    spotRemote: {
                        permanentPairingCode: ''
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: COMMON_BACKEND_PERM_CODE
                }
            });
        });
    });
    describe('does not loose any data', () => {
        it('if something is stored under Spot TV or Spot Remote backend reducers', () => {
            jest.spyOn(persistence, 'get')
                .mockReturnValue({
                    'spot-tv/backend': {
                        permanentPairingCode: SPOT_TV_PERM_CODE,
                        longLivedPairingCodeInfo: {
                            abc: true
                        }
                    },
                    spotRemote: {
                        permanentPairingCode: SPOT_REMOTE_PERM_CODE,
                        completedOnboarding: true
                    }
                });

            expect(getPersistedState()).toMatchObject({
                backend: {
                    permanentPairingCode: SPOT_TV_PERM_CODE
                },
                'spot-tv/backend': {
                    longLivedPairingCodeInfo: {
                        abc: true
                    }
                },
                spotRemote: {
                    completedOnboarding: true
                }
            });
        });
    });
});
