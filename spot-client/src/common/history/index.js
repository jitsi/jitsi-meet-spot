import { createBrowserHistory } from 'history';

/**
 * Gets the basename (aka subdirectory) where the app is running.
 *
 * @returns {string} The app's basename.
 */
function getBaseName() {
    const { pathname } = window.location;
    const idx = pathname.lastIndexOf('/');

    return idx === -1 ? '/' : pathname.substring(0, idx + 1);
}

export const history = createBrowserHistory({
    basename: getBaseName()
});
