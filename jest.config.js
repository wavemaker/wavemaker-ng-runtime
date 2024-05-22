const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require('./tsconfig.json');


module.exports = {
  preset: "jest-preset-angular",
  roots: ["<rootDir>/projects"],
  testEnvironment: "jsdom",
  testMatch: [
  // "**/projects/components/widgets/basic/**/*.spec.ts"
     "**/projects/**/*.spec.ts"
   //   "**/projects/components/widgets/data/table/src/table.wrapper.component.spec.ts"
    //  "**/projects/components/widgets/basic/**/*.spec.ts"
    //  "**/projects/components/widgets/input/calendar/src/calendar.wrapper.component.spec.ts"
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
      "@wm/components/basic": "<rootDir>/projects/components/widgets/basic/default/src/public_api.ts",
      "@wm/components/input": "<rootDir>/projects/components/widgets/input/default/src/public_api.ts",
      "@wm/components/dialogs": "<rootDir>/projects/components/widgets/dialogs/default/src/public_api.ts",
      "@wm/components/page": "<rootDir>/projects/components/widgets/page/default/src/public_api.ts",
      "@wm/components/(.*)/(.*)$": "<rootDir>/projects/components/widgets/$1/$2/src/public_api.ts",
      "@wm/components/(.*)$": "<rootDir>/projects/components/widgets/$1/src/public_api.ts",

      "@wm/(.*)$": "<rootDir>/projects/$1/index.ts",
      "projects/(.*)$": "<rootDir>/projects/$1",
      "libraries/(.*)$": "<rootDir>/libraries/$1"
  }

};
