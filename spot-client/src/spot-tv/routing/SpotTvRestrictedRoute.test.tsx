import { render } from '@testing-library/react';
import * as detection from 'common/detection';
import { ROUTES } from 'common/routing';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import { SpotTvRestrictedRoute } from './SpotTvRestrictedRoute';

jest.mock('common/detection', () => {
    return {
        isElectron: jest.fn(),
        isSupportedSpotTvBrowser: jest.fn()
    };
});

describe('SpotTvRestrictedRoute', () => {
    const MOCK_ROUTE = '/mock-route';

    let isSupportedBrowserSpy: jest.SpyInstance;
    let pathRenderSpy: jest.Mock;
    let currentPath: string | undefined;

    beforeEach(() => {
        isSupportedBrowserSpy = jest.spyOn(detection, 'isSupportedSpotTvBrowser');
        isSupportedBrowserSpy.mockReturnValue(true);

        pathRenderSpy = jest.fn();
        currentPath = undefined;
    });

    /**
     * Helper to mount {@code SpotTvRestrictedRoute} so it can be tested.
     *
     * @param props - Prop to pass into the route.
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
                <SpotTvRestrictedRoute
                    isBackendSetupComplete = { isBackendSetupComplete }
                    path = { MOCK_ROUTE }
                    render = { pathRenderSpy }
                    requireSetup = { requireSetup } />
                <Route
                    path = '*'
                    render = { ({ location }) => {
                        currentPath = location.pathname;

                        return null;
                    } } />
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

            expect(pathRenderSpy).not.toHaveBeenCalled();
            expect(currentPath).toBe(ROUTES.UNSUPPORTED_BROWSER);
        });
    });

    describe('with setup required', () => {
        it('redirects to setup if not complete', () => {
            renderRestrictedRoute({
                isBackendSetupComplete: false,
                requireSetup: true
            });

            expect(pathRenderSpy).not.toHaveBeenCalled();
            expect(currentPath).toBe(ROUTES.SETUP);
        });

        it('proceeds to the route if setup is complete', () => {
            renderRestrictedRoute({
                isBackendSetupComplete: true,
                requireSetup: true
            });

            expect(pathRenderSpy).toHaveBeenCalled();
            expect(currentPath).toBe(MOCK_ROUTE);
        });
    });
});
