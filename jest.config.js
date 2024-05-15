module.exports = {
    transformIgnorePatterns: [
        '<rootDir>/node_modules/', // Ignore files in node_modules directory
        '<rootDir>/libraries/components/*/default/', // Ignore specific directory causing collision
        // Add more patterns if needed
    ],
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
    },
    roots: ["<rootDir>/projects/"],
    testEnvironment: "jsdom",
    testMatch: [
        "**/projects/**/*.spec.ts"
        ],
    collectCoverage: true,
    coverageReporters: ["html"],
    coverageDirectory: "coverage",
    preset: 'jest-preset-angular'
};
