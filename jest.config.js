module.exports = {
  preset: "jest-preset-angular",
  roots: ["<rootDir>/projects"],
  testEnvironment: "jsdom",
  testMatch: [
     "**/projects/**/*.spec.ts"
     // "**/projects/components/widgets/input/epoch/**/*.spec.ts"
    //  "**/projects/components/widgets/input/epoch/src/time/time.wrapper.component.spec.ts"
     // "**/projects/components/widgets/input/epoch/src/date-time/datetime.wrapper.component.spec.ts"
     // "**/projects/components/widgets/input/epoch/src/date/date.wrapper.component.spec.ts"
    //  "**/projects/components/widgets/navigation/popover/src/popover.wrapper.component.spec.ts"
    //  "**/projects/components/widgets/input/epoch/src/date-time/datetime.wrapper.component.spec.ts"

  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.js"],
  collectCoverage: true,
  coverageReporters: ["html", "json-summary"],
  coveragePathIgnorePatterns:["libraries/scripts/tree-keyboard-navigation",
  "libraries/scripts/jquery.ui.touch-punch",
  "libraries/scripts/swipey",
  ".yalc/@wavemaker/variables/src/"
  ],
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
