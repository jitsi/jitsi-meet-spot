import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        // `config.js` is a runtime browser config artifact (not part of the TS sources).
        ignores: [ 'dist/**', 'coverage/**', 'node_modules/**', 'config.js' ]
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [ js.configs.recommended, ...tseslint.configs.recommended ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.node
            }
        },
        rules: {
            'no-console': 'warn',

            // spot-client interfaces with untyped external surfaces (lib-jitsi-meet,
            // the Jitsi external API, loosely-typed Redux actions/state).
            '@typescript-eslint/no-explicit-any': 'off',

            // Match tsc's noUnusedLocals/noUnusedParameters convention: `_`-prefixed = intentionally unused.
            '@typescript-eslint/no-unused-vars': [ 'error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                ignoreRestSiblings: true
            } ]
        }
    },
    {
        files: ['**/*.mjs'],
        extends: [ js.configs.recommended ],
        languageOptions: { sourceType: 'module', globals: { ...globals.node } }
    },
    {
        // Node tooling config files (webpack.config.js, jest.config.js, babel.config.js).
        files: ['*.{js,cjs}'],
        extends: [ js.configs.recommended ],
        languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } }
    }
);
