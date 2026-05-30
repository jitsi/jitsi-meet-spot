import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**']
    },
    {
        files: ['**/*.ts'],
        extends: [ js.configs.recommended, ...tseslint.configs.recommended ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            // This is a console-driven mock server; logging is expected.
            'no-console': 'off'
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
        files: ['**/*.cjs'],
        extends: [ js.configs.recommended ],
        languageOptions: {
            sourceType: 'commonjs',
            globals: { ...globals.node }
        }
    }
);
