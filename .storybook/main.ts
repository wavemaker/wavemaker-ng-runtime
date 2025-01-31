import type { StorybookConfig } from "@storybook/angular";
import $ from 'jquery';

const config: StorybookConfig = {
  stories: [
    "../projects/components/widgets/**/**/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../projects/components/widgets/**/**/src/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    //"@storybook/addon-interactions", //Disbaled panel interactions as we are not using.
    "@storybook/addon-variants",
     './addons/css-tokens/manager.js',
    // './addons/addon-panel/manager.js',
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  staticDirs: ["../public"]
};
export default config;
