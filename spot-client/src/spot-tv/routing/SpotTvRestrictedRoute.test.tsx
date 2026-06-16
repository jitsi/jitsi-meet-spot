import { render, screen } from '@testing-library/react';
import * as detection from 'common/detection';
import { ROUTES } from 'common/routing';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SpotTvRestrictedRoute } from './SpotTvRestrictedRoute';

jest.mock('common/detection', () => {
    return {
        isElectron: jest.fn(),
        isSupportedSpotTvBrowser: jest.fn()
    };
});

describe('SpotTvRestrictedRoute', () => {
    const MOCK_ROUTE = '/mock-route';
    const PROTECTED_CONTENT = 'protected-content';

    let isSupportedBrowserSpy: jest.SpyInstance;

    beforeEach(() => {
        isSupportedBrowserSpy = jest.spyOn(detection, 'isSupportedSpotTvBrowser');
        isSupportedBrowserSpy.mockReturnValue(true);
    });

    /**
     * Helper to render {@code SpotTvRestrictedRoute} so it can be tested. The
     * route table mirrors the real app: the guarded route renders the protected
     * content while the unsupported-browser and setup routes render markers the
     * assertions can detect a redirect by.
     *
     * @param props - Props to pass into the route.
     * @private
     * @returns
     */
    function renderRestrictedRoute({ isBackendSetupComplete, requireSetup }: {
        isBackendSetupComplete: boolean;
        requireSetup: boolean;
    }) {
        return render(
            <MemoryRouter
                initialEntries = { [ MOCK_ROUTE ] }
                initialIndex = { 0 }>
                <Routes>
                    <Route
                        element = {
                            <SpotTvRestrictedRoute
                                isBackendSetupComplete = { isBackendSetupComplete }
                                requireSetup = { requireSetup }>
                                <div>{ PROTECTED_CONTENT }</div>
                            </SpotTvRestrictedRoute>
                        }
                        path = { MOCK_ROUTE } />
                    <Route
                        element = { <div>unsupported</div> }
                        path = { ROUTES.UNSUPPORTED_BROWSER } />
                    <Route
                        element = { <div>setup</div> }
                        path = { ROUTES.SETUP } />
                </Routes>
            </MemoryRouter>
        );
    }

    describe('in unsupported environments', () => {
        beforeEach(() => {
            isSupportedBrowserSpy.mockReturnValue(false);
        });

        it('redirects to the unsupported page', () => {
            renderRestrictedRoute({
                isBackendSetupComplete: false,
                requireSetup: false
            });

            expect(screen.queryByText(PROTECTED_CONTENT)).toBeNull();
            expect(screen.getByText('unsupported')).toBeInTheDocument();
        });
    });

    describe('with setup required', () => {
        it('redirects to setup if not complete', () => {
            renderRestrictedRoute({
                isBackendSetupComplete: false,
                requireSetup: true
            });

            expect(screen.queryByText(PROTECTED_CONTENT)).toBeNull();
            expect(screen.getByText('setup')).toBeInTheDocument();
        });

        it('proceeds to the route if setup is complete', () => {
            renderRestrictedRoute({
                isBackendSetupComplete: true,
                requireSetup: true
            });

            expect(screen.getByText(PROTECTED_CONTENT)).toBeInTheDocument();
        });
    });
});
