import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ColorPickerComponent } from './color-picker.component';

const meta: Meta<ColorPickerComponent> = {
  title: 'Form/ColorPicker',
  component: ColorPickerComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<ColorPickerComponent>;

export const Default: Story = {
  args: {
  },
};