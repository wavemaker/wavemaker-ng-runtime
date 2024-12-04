import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';
import waveTheme from './wavedesign-theme';


addons.setConfig({
  theme: waveTheme,
});