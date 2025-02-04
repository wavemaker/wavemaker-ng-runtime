import type { StorybookConfig } from "@storybook/angular";
import $ from 'jquery';

const config: StorybookConfig = {
  stories: [
    "../projects/components/widgets/**/**/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../projects/components/widgets/**/**/src/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-variants",
    //"@storybook/addon-essentials",
    {
      name: "@storybook/addon-essentials",
      options: {
        actions: false,
      },
    },
    // "@chromatic-com/storybook",
    //"@storybook/addon-interactions", //Disbaled panel interactions as we are not using.
    './addons/css-tokens/manager.js',
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  staticDirs: ["../public"]
};
export default config;
