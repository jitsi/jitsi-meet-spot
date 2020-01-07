import { mount } from 'enzyme';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SpotTvRestrictedRoute } from './SpotTvRestrictedRoute';
import * as detection from 'common/detection';
import { ROUTES } from 'common/routing';

jest.mock('common/detection', () => {
    return {
        isElectron: jest.fn(),
        isSupportedSpotTvBrowser: jest.fn()
    };
});

describe('SpotTvRestrictedRoute', () => {
    const MOCK_ROUTE = '/mock-route';

    let isSupportedBrowserSpy, pathRenderSpy, restrictedRoute;

    beforeEach(() => {
        isSupportedBrowserSpy = jest.spyOn(detection, 'isSupportedSpotTvBrowser');
        isSupportedBrowserSpy.mockReturnValue(true);

        pathRenderSpy = jest.fn();
    });

    /**
     * Helper to mount {@code SpotTvRestrictedRoute} so it can be tested.
     *
     * @param {Object} props - Prop to pass into the route.
     * @private
     * @returns {ReactWrapper}
     */
    function renderRestrictedRoute({ isBackendSetupComplete, requireSetup }) {
        return mount(
            <MemoryRouter
                initialEntries = { [ MOCK_ROUTE ] }
                initialIndex = { 0 }>
                <SpotTvRestrictedRoute
                    isBackendSetupComplete = { isBackendSetupComplete }
                    path = { MOCK_ROUTE }
                    render = { pathRenderSpy }
                    requireSetup = { requireSetup } />
            </MemoryRouter>
        );
    }

    describe('in unsupported environments', () => {
        beforeEach(() => {
            isSupportedBrowserSpy.mockReturnValue(false);
        });

        it('redirects to the unsupported page', () => {
            restrictedRoute = renderRestrictedRoute({
                isBackendSetupComplete: false,
                requireSetup: false
            });

            expect(pathRenderSpy).not.toHaveBeenCalled();
            expect(
              restrictedRoute
                  .find('Router')
                  .prop('history')
                  .location
                  .pathname
            ).toBe(ROUTES.UNSUPPORTED_BROWSER);
        });
    });

    describe('with setup required', () => {
        it('redirects to setup if not complete', () => {
            restrictedRoute = renderRestrictedRoute({
                isBackendSetupComplete: false,
                requireSetup: true
            });

            expect(pathRenderSpy).not.toHaveBeenCalled();
            expect(
              restrictedRoute
                  .find('Router')
                  .prop('history')
                  .location
                  .pathname
            ).toBe(ROUTES.SETUP);
        });

        it('proceeds to the route if setup is complete', () => {
            restrictedRoute = renderRestrictedRoute({
                isBackendSetupComplete: true,
                requireSetup: true
            });

            expect(pathRenderSpy).toHaveBeenCalled();
            expect(
                restrictedRoute
                    .find('Router')
                    .prop('history')
                    .location
                    .pathname
            ).toBe(MOCK_ROUTE);
        });
    });
});
