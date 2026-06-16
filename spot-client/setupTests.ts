import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// React Router v7 references TextEncoder/TextDecoder at module-load time, but
// jsdom does not expose them as globals, so polyfill them from Node's `util`
// before any test module imports react-router-dom.
Object.assign(global, {
    TextDecoder,
    TextEncoder
});

jest.mock('./src/common/logger');

jest.mock('common/vendor', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories are hoisted and cannot reference outer imports.
    const { mockJitsiMeetJSProvider } = require('./src/common/test-mocks');

    return {
        JitsiMeetJSProvider: mockJitsiMeetJSProvider
    };
});

// strophe.js 1.2.16 is an old UMD that relied on a CommonJS top-level `this` (no
// longer provided under jest 30), so it cannot be imported directly in jsdom. The
// XMPP layer is covered by the spot-webdriver E2E tests; here it is only imported
// transitively, so a light mock is sufficient.
jest.mock('strophe.js', () => ({
    $iq: jest.fn(),
    Strophe: {
        getResourceFromJid: jest.fn(() => '')
    }
}));

fetchMock.enableMocks();
