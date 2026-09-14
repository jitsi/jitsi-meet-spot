/**
 * Geometry for the animated "wave" background (in the spirit of the PS3 XMB
 * backdrop). Every ribbon is a closed SVG path whose top and bottom edges are
 * sums of sine waves. Sampling the ribbon at evenly spaced phases produces a
 * list of path strings with an identical command structure, which the
 * browser can interpolate between (Web Animations keyframes on the CSS
 * {@code d} property, or SMIL {@code <animate attributeName="d">}) to make
 * the ribbon roll across the screen and gently rise and fall. Because every phase
 * multiplier is an integer, the frame at phase 2π equals the frame at phase 0
 * and the animation loops seamlessly.
 */

/**
 * The coordinate space the paths are generated in. The SVG scales it to the
 * screen with {@code preserveAspectRatio="xMidYMid slice"}.
 */
export const VIEWBOX_WIDTH = 1920;
export const VIEWBOX_HEIGHT = 1080;

/**
 * How many evenly spaced x samples are taken across the width (plus bleed).
 * More samples follow the sines more closely at the cost of larger paths.
 */
const SAMPLES = 14;

/**
 * Horizontal overshoot beyond the viewBox, as a fraction of its width, so the
 * ribbon ends never become visible when the screen is wider than 16:9.
 */
const BLEED = 0.08;

/**
 * Number of frames generated per loop. Frames are interpolated linearly, so
 * 15 degrees of phase per frame is visually indistinguishable from the true
 * sine motion.
 */
export const FRAMES_PER_LOOP = 24;

/**
 * Describes one ribbon. All lengths are fractions of the viewBox height so
 * the design is resolution independent.
 */
export interface IRibbonSpec {
    /** Vertical position of the ribbon's top edge midline (0 = top, 1 = bottom). */
    baseY: number;

    /** Amplitude of the main wave. */
    amplitude: number;

    /** How many full wavelengths of the main wave span the viewBox width. */
    wavelengths: number;

    /** Amplitude of the secondary, faster wave that travels the other way. */
    ripple: number;

    /** How far the whole ribbon slowly drifts up and down during one loop. */
    drift: number;

    /** Mean thickness of the ribbon. It swells and thins along its length. */
    thickness: number;

    /** Direction of travel: 1 moves the wave crests towards the left, -1 towards the right. */
    direction: 1 | -1;

    /** Duration of one loop, in seconds. Use co-prime-ish values so the composite never repeats quickly. */
    duration: number;

    /** Fill opacity of the ribbon. */
    opacity: number;

    /** Whether the ribbon edges get a brighter stroke (the thin "sheet" ribbons do, the wide glow does not). */
    edge: boolean;
}

interface IPoint {
    x: number;
    y: number;
}

/**
 * The ribbons that make up the default background, drawn back to front. The
 * first is a wide, faint glow band standing in for the XMB backdrop haze; the
 * rest are the translucent sheets rolling across it.
 */
export const RIBBONS: IRibbonSpec[] = [
    {
        baseY: 0.36,
        amplitude: 0.06,
        wavelengths: 0.6,
        ripple: 0.02,
        drift: 0.04,
        thickness: 0.6,
        direction: 1,
        duration: 47,
        opacity: 0.3,
        edge: false
    },
    {
        baseY: 0.5,
        amplitude: 0.07,
        wavelengths: 1.1,
        ripple: 0.025,
        drift: 0.05,
        thickness: 0.18,
        direction: -1,
        duration: 31,
        opacity: 0.45,
        edge: true
    },
    {
        baseY: 0.6,
        amplitude: 0.09,
        wavelengths: 1.4,
        ripple: 0.03,
        drift: 0.06,
        thickness: 0.11,
        direction: 1,
        duration: 23,
        opacity: 0.6,
        edge: true
    },
    {
        baseY: 0.7,
        amplitude: 0.06,
        wavelengths: 1.9,
        ripple: 0.02,
        drift: 0.05,
        thickness: 0.06,
        direction: -1,
        duration: 19,
        opacity: 0.8,
        edge: true
    },
    {
        baseY: 0.3,
        amplitude: 0.07,
        wavelengths: 0.9,
        ripple: 0.04,
        drift: 0.07,
        thickness: 0.035,
        direction: 1,
        duration: 37,
        opacity: 0.55,
        edge: true
    }
];

/**
 * Formats a number with at most one decimal, without a trailing ".0", to keep
 * the generated path strings compact.
 *
 * @param value - The number to format.
 * @returns The formatted number.
 */
function fmt(value: number) {
    return String(Math.round(value * 10) / 10);
}

/**
 * Converts a polyline into a smooth cubic Bezier path fragment (Catmull-Rom
 * splines converted to Bezier control points), starting at the first point.
 *
 * @param points - The points to pass through, in order.
 * @param command - The command used to reach the first point ("M" or "L").
 * @returns The path fragment.
 */
function smoothThrough(points: IPoint[], command: 'M' | 'L') {
    const parts = [ `${command}${fmt(points[0].x)},${fmt(points[0].y)}` ];

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];

        const c1x = p1.x + ((p2.x - p0.x) / 6);
        const c1y = p1.y + ((p2.y - p0.y) / 6);
        const c2x = p2.x - ((p3.x - p1.x) / 6);
        const c2y = p2.y - ((p3.y - p1.y) / 6);

        parts.push(`C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2.x)},${fmt(p2.y)}`);
    }

    return parts.join('');
}

/**
 * Computes the closed ribbon outline at a given phase.
 *
 * @param spec - The ribbon description.
 * @param phase - The animation phase, in radians.
 * @returns The SVG path data.
 */
export function ribbonPath(spec: IRibbonSpec, phase: number) {
    const W = VIEWBOX_WIDTH;
    const H = VIEWBOX_HEIGHT;
    const dir = spec.direction;
    const top: IPoint[] = [];
    const bottom: IPoint[] = [];
    const startX = -BLEED * W;
    const span = (1 + (2 * BLEED)) * W;

    for (let i = 0; i <= SAMPLES; i++) {
        const x = startX + ((span * i) / SAMPLES);
        const t = x / W;
        const main = spec.amplitude * Math.sin((2 * Math.PI * spec.wavelengths * t) + (dir * phase));
        const ripple = spec.ripple * Math.sin((2 * Math.PI * spec.wavelengths * 2.3 * t) - (dir * 2 * phase) + 1);
        const drift = spec.drift * Math.sin(phase);
        const swell = 0.55 + (0.45 * Math.sin((2 * Math.PI * spec.wavelengths * 0.8 * t) + (dir * phase) + 2));
        const y = H * (spec.baseY + main + ripple + drift);

        top.push({ x, y });
        bottom.push({ x, y: y + (H * spec.thickness * swell) });
    }

    bottom.reverse();

    return `${smoothThrough(top, 'M')}${smoothThrough(bottom, 'L')}Z`;
}

/**
 * Generates the key frames of a ribbon for one full loop. The last frame is
 * the first one again so a repeating animation is seamless.
 *
 * @param spec - The ribbon description.
 * @returns The list of path data strings, one per frame.
 */
export function ribbonFrames(spec: IRibbonSpec) {
    const frames: string[] = [];

    for (let i = 0; i < FRAMES_PER_LOOP; i++) {
        frames.push(ribbonPath(spec, (2 * Math.PI * i) / FRAMES_PER_LOOP));
    }

    frames.push(frames[0]);

    return frames;
}
