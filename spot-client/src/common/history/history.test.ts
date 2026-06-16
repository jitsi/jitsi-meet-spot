import { addBasename, stripBasename } from './index';

describe('history basename helpers', () => {
    describe('addBasename', () => {
        it('returns the path unchanged at the document root', () => {
            expect(addBasename('/tv', '/')).toBe('/tv');
            expect(addBasename('/', '/')).toBe('/');
            expect(addBasename('/meeting?location=x', '/')).toBe('/meeting?location=x');
        });

        it('prefixes a sub-directory basename (with trailing slash)', () => {
            expect(addBasename('/tv', '/spot/')).toBe('/spot/tv');
            expect(addBasename('/remote-control', '/spot/')).toBe('/spot/remote-control');
        });

        it('prefixes a sub-directory basename (without trailing slash)', () => {
            expect(addBasename('/tv', '/spot')).toBe('/spot/tv');
        });

        it('preserves a query string after the prefixed pathname', () => {
            expect(addBasename('/meeting?location=https%3A%2F%2Fx', '/spot/'))
                .toBe('/spot/meeting?location=https%3A%2F%2Fx');
        });

        it('maps the root path to the bare basename (matching React Router)', () => {
            expect(addBasename('/', '/spot/')).toBe('/spot');
        });

        it('does not double the separator', () => {
            expect(addBasename('/tv', '/spot/')).not.toContain('//');
        });
    });

    describe('stripBasename', () => {
        it('returns the pathname unchanged at the document root', () => {
            expect(stripBasename('/tv', '/')).toBe('/tv');
            expect(stripBasename('/', '/')).toBe('/');
        });

        it('strips a sub-directory basename', () => {
            expect(stripBasename('/spot/tv', '/spot/')).toBe('/tv');
            expect(stripBasename('/spot/remote-control', '/spot')).toBe('/remote-control');
        });

        it('maps the bare basename (with or without trailing slash) to root', () => {
            expect(stripBasename('/spot', '/spot/')).toBe('/');
            expect(stripBasename('/spot/', '/spot/')).toBe('/');
        });

        it('only strips a whole leading path segment', () => {
            // '/spotty' is NOT under the '/spot' basename.
            expect(stripBasename('/spotty', '/spot/')).toBe('/spotty');
        });

        it('leaves a pathname outside the basename unchanged', () => {
            expect(stripBasename('/other/tv', '/spot/')).toBe('/other/tv');
        });

        it('round-trips with addBasename', () => {
            const base = '/spot/';

            for (const route of [ '/', '/tv', '/remote-control', '/setup' ]) {
                expect(stripBasename(addBasename(route, base), base)).toBe(route);
            }
        });
    });
});
