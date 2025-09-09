module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'error',
        'no-undef': 'error',
    },
    extends: [
        "airbnb-base",
        "prettier",
    ],
}
