/**
 * Ambient module declarations for runtime dependencies that ship no TypeScript
 * types. This file is intentionally a *script* (no top-level import/export) so
 * these act as ambient module declarations (which suppress the "no declaration
 * file" error even for physically-present JS packages), rather than module
 * augmentations.
 */

declare module 'strophe.js';
declare module '@jitsi/logger';
declare module '@jitsi/js-utils/random';
declare module '@jitsi/js-utils/uri';
declare module '@wojtekmaj/enzyme-adapter-react-17';

// Non-code asset imports handled by webpack loaders (style/css/sass-loader, asset/inline).
declare module '*.scss';
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.woff';
declare module '*.ttf';
declare module '*.eot';
