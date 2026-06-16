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

/**
 * The basename without its trailing slash ({@code ''} at the document root),
 * used to add/strip the subdirectory prefix below.
 *
 * @param base - The basename to normalize.
 * @returns The prefix to prepend/strip ({@code ''} for the document root).
 */
function basePrefix(base: string): string {
    return base === '/' ? '' : base.replace(/\/+$/, '');
}

/**
 * Prefixes a root-relative path with the app basename, mirroring what React
 * Router's {@code navigate()} does for component-driven navigation.
 * {@code history@5} dropped {@code createBrowserHistory}'s {@code basename}
 * option, so imperative navigation through the shared singleton must add it
 * explicitly — otherwise a sub-directory deployment would push basename-less
 * URLs that {@code <Routes>} can no longer match (rendering a blank screen).
 *
 * @param path - A root-relative path (may include a query string/hash).
 * @param base - The basename to prepend (defaults to the app's).
 * @returns The path with the basename prefixed.
 */
export function addBasename(path: string, base: string = basename): string {
    const prefix = basePrefix(base);

    if (!prefix) {
        return path;
    }

    return path === '/' ? prefix : `${prefix}${path}`;
}

/**
 * Removes the app basename from a pathname so it can be compared against the
 * root-relative {@code ROUTES} constants. Mirrors the segment-aware basename
 * stripping React Router applies to its own location (so e.g. {@code /spotty}
 * is not treated as living under the {@code /spot} basename).
 *
 * @param pathname - A (possibly basename-prefixed) pathname.
 * @param base - The basename to strip (defaults to the app's).
 * @returns The pathname relative to the basename.
 */
export function stripBasename(pathname: string, base: string = basename): string {
    const prefix = basePrefix(base);

    if (!prefix || !pathname.startsWith(prefix)) {
        return pathname;
    }

    const nextChar = pathname.charAt(prefix.length);

    // Only strip when the basename is a whole leading path segment.
    if (nextChar && nextChar !== '/') {
        return pathname;
    }

    return pathname.slice(prefix.length) || '/';
}

/**
 * Imperatively navigates the shared history to a root-relative route, applying
 * the basename. Use this instead of {@code history.push} for navigation that
 * does not go through React Router (thunks, services) so it produces the same
 * URLs as component-driven navigation.
 *
 * @param to - The root-relative route to navigate to.
 * @returns {void}
 */
export function pushRoute(to: string): void {
    history.push(addBasename(to));
}
