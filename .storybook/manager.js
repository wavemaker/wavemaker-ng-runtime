import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';
import waveTheme from './wavedesign-theme';
import "./style/theme.css";

addons.setConfig({
  theme: waveTheme,
});