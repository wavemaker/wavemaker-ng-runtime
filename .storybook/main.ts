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
    "@storybook/addon-interactions",
    "@storybook/addon-variants"
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
};
export default config;
