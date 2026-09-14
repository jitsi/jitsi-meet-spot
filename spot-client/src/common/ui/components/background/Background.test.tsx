import { render } from '@testing-library/react';
import React from 'react';

import { Background } from './Background';

describe('Background', () => {
    it('shows the animated wave on Spot-TV when no image is configured', () => {
        const { container } = render(<Background isSpotTv = { true } />);

        expect(container.querySelector('svg.wave-background')).not.toBeNull();
        expect(container.querySelector('.view-gradient')).toBeNull();
    });

    it('shows only the plain gradient on Spot-Remote', () => {
        const { container } = render(<Background isSpotTv = { false } />);

        expect(container.querySelector('svg.wave-background')).toBeNull();
        expect(container.querySelector('.view-gradient')).not.toBeNull();
        expect(container.querySelector<HTMLElement>('.view-background-container')?.style.background).toBe('');
    });

    it('shows a configured image with the gradient on both roles', () => {
        for (const isSpotTv of [ true, false ]) {
            const { container, unmount } = render(
                <Background
                    backgroundUrl = 'https://example.com/bg.png'
                    isSpotTv = { isSpotTv } />
            );

            expect(container.querySelector('svg.wave-background')).toBeNull();
            expect(container.querySelector('.view-gradient')).not.toBeNull();
            expect(container.querySelector<HTMLElement>('.view-background-container')?.style.background)
                .toContain('https://example.com/bg.png');

            unmount();
        }
    });
});
