import React, { useEffect, useRef } from 'react';

import {
    RIBBONS,
    VIEWBOX_HEIGHT,
    VIEWBOX_WIDTH,
    ribbonFrames
} from './wavePaths';

/**
 * The animation frames are pure functions of the ribbon specs, so compute
 * them once for the lifetime of the bundle rather than on every render.
 */
const RIBBON_FRAMES = RIBBONS.map(ribbonFrames);

/**
 * Whether the browser can drive the ribbons through the Web Animations API.
 *
 * Chromium only starts SVG SMIL timelines once the window "load" event has
 * fired, and Spot delays that event by loading lib-jitsi-meet and the Jitsi
 * external API at startup, so SMIL alone left the waves frozen for seconds.
 * Web Animations run on the document timeline from navigation start, so
 * they move immediately; SMIL stays as the fallback for browsers without them.
 *
 * @returns {boolean}
 */
function supportsWebAnimations() {
    return typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
}

/**
 * The default Spot-TV background: slowly rolling translucent ribbons on black,
 * in the spirit of the PS3 XMB wave. Besides looking the part, the constant
 * gentle motion keeps any single pixel from displaying the same value for
 * long, which mitigates burn-in on the TVs Spot-TV is left running on.
 *
 * Colors are set in CSS ({@code _background.scss}): the darkest value is pure
 * black and the lightest is {@code --backdrop-color}, the app's default
 * background color. Each ribbon morphs through its precomputed path frames,
 * preferably via the Web Animations API (see {@link supportsWebAnimations})
 * and otherwise via SMIL, so no JavaScript timers are involved either way.
 *
 * @returns {ReactElement}
 */
export default function WaveBackground() {
    const svgRef = useRef<SVGSVGElement>(null);
    const useWebAnimations = supportsWebAnimations();

    useEffect(() => {
        if (!useWebAnimations || !svgRef.current) {
            return undefined;
        }

        const paths = svgRef.current.querySelectorAll<SVGPathElement>('path.wave-background__ribbon');
        const animations = Array.from(paths, (path, index) => path.animate(
            RIBBON_FRAMES[index].map(d => ({ d: `path('${d}')` })),
            {
                duration: RIBBONS[index].duration * 1000,
                easing: 'linear',
                iterations: Infinity
            }
        ));

        return () => {
            for (const animation of animations) {
                animation.cancel();
            }
        };
    }, [ useWebAnimations ]);

    return (
        <svg
            aria-hidden = 'true'
            className = 'wave-background'
            focusable = 'false'
            preserveAspectRatio = 'xMidYMid slice'
            ref = { svgRef }
            viewBox = { `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}` }>
            <rect
                className = 'wave-background__base'
                height = { VIEWBOX_HEIGHT }
                width = { VIEWBOX_WIDTH } />
            { RIBBONS.map((ribbon, index) => {
                const frames = RIBBON_FRAMES[index];

                return (
                    <path
                        className = { `wave-background__ribbon${ribbon.edge ? ' wave-background__ribbon--edge' : ''}` }
                        d = { frames[0] }
                        fillOpacity = { ribbon.opacity }
                        key = { index }>
                        { useWebAnimations ? null : (
                            <animate
                                attributeName = 'd'
                                dur = { `${ribbon.duration}s` }
                                repeatCount = 'indefinite'
                                values = { frames.join(';') } />
                        ) }
                    </path>
                );
            }) }
        </svg>
    );
}
