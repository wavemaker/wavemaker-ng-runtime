import { create } from '@storybook/theming';

export default create({
  base: 'normal',
  brandTitle: 'WaveDesign Storybook',
  brandUrl: 'https://wavemaker.com',
  brandImage: 'https://wm-storybook.s3.us-east-1.amazonaws.com/Logo.png',
  brandTarget: '_self',

  // fontBase: "neurial-grotesk-regular",

  // Colors
  // colorPrimary: "rgba(135, 135, 135, 1)",
  colorSecondary: "#296df6",

  // UI
  appBg:
    "linear-gradient(170deg, rgb(226, 244, 254) 14.38%, rgb(218, 217, 252) 99.86%)",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  // appBorderColor: "rgba(0, 0, 0, 0.10)",
  appBorderRadius: 6,

  // Text colors
  textColor: "rgba(48, 48, 48, 1)",
  textInverseColor: "#ffffff",

  // Toolbar default and active colors
  // barTextColor: "#5E686F",
  // barSelectedColor: "rgba(41, 109, 246, 0.14)",
  // barHoverColor: "#5E686F",
  // barBg: "#fff",

  // Form colors
  // inputBg: "#ffffff",
  // inputBorder: "rgba(0, 0, 0, 0.10)",
  // inputTextColor: "rgba(48, 48, 48, 1)",
  // inputBorderRadius: 4,
});