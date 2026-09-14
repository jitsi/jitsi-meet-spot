import {
    FRAMES_PER_LOOP,
    RIBBONS,
    VIEWBOX_HEIGHT,
    VIEWBOX_WIDTH,
    ribbonFrames,
    ribbonPath
} from './wavePaths';

/**
 * Splits path data into its command letters, ignoring the numbers.
 *
 * @param d - The path data.
 * @returns The sequence of commands.
 */
function commandsOf(d: string) {
    return d.replace(/[^MLCZ]/g, '');
}

describe('wavePaths', () => {
    describe('ribbonPath', () => {
        it('produces a closed path made of smooth curves', () => {
            const d = ribbonPath(RIBBONS[0], 0);

            expect(d).toMatch(/^M[-\d.,]+(C[-\d., ]+)+L[-\d.,]+(C[-\d., ]+)+Z$/);
        });

        it('bleeds past both horizontal edges of the viewBox', () => {
            const d = ribbonPath(RIBBONS[0], 0);
            const xs = Array.from(d.matchAll(/[MLC](-?[\d.]+),/g), match => Number(match[1]));

            expect(Math.min(...xs)).toBeLessThan(0);
            expect(Math.max(...xs)).toBeGreaterThan(VIEWBOX_WIDTH);
        });

        it('keeps the top edge of every ribbon on screen at every phase', () => {
            for (const spec of RIBBONS) {
                for (let i = 0; i < FRAMES_PER_LOOP; i++) {
                    const d = ribbonPath(spec, (2 * Math.PI * i) / FRAMES_PER_LOOP);

                    // The top edge runs from the M command up to the L that starts the bottom edge.
                    const topEdge = d.slice(0, d.indexOf('L'));
                    const ys = Array.from(topEdge.matchAll(/,(-?[\d.]+)/g), match => Number(match[1]));

                    expect(ys.length).toBeGreaterThan(0);
                    expect(Math.min(...ys)).toBeGreaterThan(0);
                    expect(Math.max(...ys)).toBeLessThan(VIEWBOX_HEIGHT);
                }
            }
        });

        it('changes with the phase so the animation actually moves', () => {
            expect(ribbonPath(RIBBONS[1], 0)).not.toBe(ribbonPath(RIBBONS[1], 1));
        });
    });

    describe('ribbonFrames', () => {
        it.each(RIBBONS.map((spec, index) => [ index, spec ] as const))(
            'ribbon %i: every frame has the same command structure so SMIL can interpolate them',
            (_index, spec) => {
                const frames = ribbonFrames(spec);
                const structure = commandsOf(frames[0]);

                expect(frames).toHaveLength(FRAMES_PER_LOOP + 1);

                for (const frame of frames) {
                    expect(commandsOf(frame)).toBe(structure);
                }
            }
        );

        it('loops seamlessly by ending on the starting frame', () => {
            const frames = ribbonFrames(RIBBONS[2]);

            expect(frames[frames.length - 1]).toBe(frames[0]);
            expect(frames[frames.length - 2]).not.toBe(frames[0]);
        });
    });
});
