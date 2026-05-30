import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'webdriver-results/**']
    },
    {
        files: ['**/*.ts'],
        extends: [ js.configs.recommended, ...tseslint.configs.recommended ],
        languageOptions: {
            globals: {
                ...globals.node,

                // `execute`/`executeAsync` callbacks run in the browser context.
                ...globals.browser,

                // Jasmine + WebdriverIO test globals.
                ...globals.jasmine,
                browser: 'readonly',
                driver: 'readonly',
                $: 'readonly',
                $$: 'readonly',
                expect: 'readonly'
            }
        },
        rules: {
            'no-console': 'warn',
            'max-len': [ 'error', 120 ],

            // This harness reaches into the running app's deeply-dynamic internals
            // (window.spot.*) which are intentionally untyped.
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        files: ['**/*.mjs'],
        extends: [ js.configs.recommended ],
        languageOptions: {
            sourceType: 'module',
            globals: { ...globals.node }
        }
    }
);
