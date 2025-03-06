import tseslint from '@typescript-eslint/eslint-plugin'

export default [
    {
        files: ['*.ts', '*.tsx'],
        plugins: { '@typescript-eslint': tseslint },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/indent': ['error', 4],
        },
    },
]
