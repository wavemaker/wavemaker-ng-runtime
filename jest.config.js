const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require('./tsconfig.json');


module.exports = {
  preset: "jest-preset-angular",
  roots: ["<rootDir>/projects"],
  testEnvironment: "jsdom",
  testMatch: [
    //"**/projects/components/widgets/data/list/src/list.wrapper.component.spec.ts"
     "**/projects/**/*.spec.ts"
    // "**/projects/components/widgets/basic/tree/src/tree.wrapper.component.spec.ts"
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.js"],
  collectCoverage: true,
  coverageReporters: ["html", "json-summary"],
    // collectCoverageFrom: [
    //     '**/*.{ts,tsx}',
    //     '!**/node_modules/**',
    //     '!**/dist/**'
    // ],
  coverageDirectory: "coverage",
  moduleNameMapper: {
      "@wm/security": "<rootDir>/projects/security/src/public_api.ts",
      "@wm/swipey": "<rootDir>/projects/swipey/src/public_api.ts",
      "@swipey": "<rootDir>/projects/swipey/src/public_api.ts",
      "@wm/components/base": "<rootDir>/projects/components/base/index.ts",
      "@wm/components/(.*)/(.*)$": "<rootDir>/projects/components/widgets/$1/$2/src/public_api.ts",
      "@wm/components/(.*)$": "<rootDir>/projects/components/widgets/$1/default/src/public_api.ts",
      "@wm/(.*)$": "<rootDir>/projects/$1/index.ts"
  }

};
