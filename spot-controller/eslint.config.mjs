import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**']
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [ js.configs.recommended, ...tseslint.configs.recommended ],
        languageOptions: {
            globals: {
                // React Native provides browser-like globals (fetch, setTimeout, console, ...).
                ...globals.browser,
                ...globals.jest,
                __DEV__: 'readonly'
            }
        }
    },
    {
        files: ['**/*.mjs'],
        extends: [ js.configs.recommended ],
        languageOptions: {
            sourceType: 'module',
            globals: { ...globals.node }
        }
    },
    {
        // Node tooling config files (babel.config.js, metro.config.js, jest.config.js, rn-cli.config.js).
        files: ['**/*.{js,cjs}'],
        extends: [ js.configs.recommended ],
        languageOptions: {
            sourceType: 'commonjs',
            globals: { ...globals.node }
        }
    }
);
