import { createBrowserHistory } from 'history';

/**
 * Gets the basename (aka subdirectory) where the app is running.
 *
 * @returns The app's basename.
 */
function getBaseName(): string {
    const { pathname } = window.location;
    const idx = pathname.lastIndexOf('/');

    return idx === -1 ? '/' : pathname.substring(0, idx + 1);
}

/**
 * The basename (aka subdirectory) the app is served from. {@code history@5}
 * dropped the {@code basename} option from {@code createBrowserHistory}, so it
 * is applied at the router layer instead (passed to {@code <HistoryRouter>} in
 * {@code index.tsx}).
 */
export const basename = getBaseName();

export const history = createBrowserHistory();
