const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require('./tsconfig.json');


module.exports = {
  preset: "jest-preset-angular",
  roots: ["<rootDir>/projects"],
  testEnvironment: "jsdom",
    testMatch: [
       // "**/projects/components/widgets/advanced/**/*.spec.ts"
        "**/projects/**/*.spec.ts"
    ],

  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.js"],
  collectCoverage: true,
  coverageReporters: ["html", "json-summary"],
  coverageDirectory: "coverage",
  moduleNameMapper: {
      "@wm/security": "<rootDir>/projects/security/src/public_api.ts",
      "@wm/swipey": "<rootDir>/projects/swipey/src/public_api.ts",
      "@swipey": "<rootDir>/projects/swipey/src/public_api.ts",
      "@wm/components/base": "<rootDir>/projects/components/base/index.ts",
      "@wm/components/basic": "<rootDir>/projects/components/widgets/basic/default/src/public_api.ts",
      "@wm/components/(.*)$": "<rootDir>/projects/components/widgets/$1/public_api.ts",
      "@wm/(.*)$": "<rootDir>/projects/$1/index.ts"
  }

};
