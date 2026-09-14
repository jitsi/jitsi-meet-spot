import { render } from '@testing-library/react';
import React from 'react';

import WaveBackground from './WaveBackground';
import { FRAMES_PER_LOOP, RIBBONS } from './wavePaths';

describe('WaveBackground', () => {
    const originalAnimate = Element.prototype.animate;

    afterEach(() => {
        Element.prototype.animate = originalAnimate;
    });

    describe('with the Web Animations API', () => {
        let cancel: jest.Mock;
        let animate: jest.Mock;

        beforeEach(() => {
            cancel = jest.fn();
            animate = jest.fn(() => ({ cancel }));
            Element.prototype.animate = animate as any;
        });

        it('starts one infinite path animation per ribbon and no SMIL fallback', () => {
            const { container } = render(<WaveBackground />);

            expect(container.querySelectorAll('animate')).toHaveLength(0);
            expect(animate).toHaveBeenCalledTimes(RIBBONS.length);

            RIBBONS.forEach((ribbon, index) => {
                const [ keyframes, options ] = animate.mock.calls[index];

                expect(keyframes).toHaveLength(FRAMES_PER_LOOP + 1);
                expect(keyframes[0].d).toMatch(/^path\('M.*Z'\)$/);
                expect(options).toEqual({
                    duration: ribbon.duration * 1000,
                    easing: 'linear',
                    iterations: Infinity
                });
            });
        });

        it('cancels the animations on unmount', () => {
            const { unmount } = render(<WaveBackground />);

            unmount();

            expect(cancel).toHaveBeenCalledTimes(RIBBONS.length);
        });
    });

    describe('without the Web Animations API', () => {
        beforeEach(() => {
            // jsdom does not implement Element.prototype.animate, but be explicit.
            Element.prototype.animate = undefined as any;
        });

        it('falls back to a SMIL animate element per ribbon', () => {
            const { container } = render(<WaveBackground />);
            const animates = container.querySelectorAll('animate');

            expect(animates).toHaveLength(RIBBONS.length);
            animates.forEach((animate, index) => {
                expect(animate.getAttribute('attributeName')).toBe('d');
                expect(animate.getAttribute('repeatCount')).toBe('indefinite');
                expect(animate.getAttribute('dur')).toBe(`${RIBBONS[index].duration}s`);
                expect(animate.getAttribute('values')?.split(';')).toHaveLength(FRAMES_PER_LOOP + 1);
            });
        });
    });
});
