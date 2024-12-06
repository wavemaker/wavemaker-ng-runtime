import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ColorPickerComponent } from './color-picker.component';

const meta: Meta<ColorPickerComponent> = {
  title: 'Form/ColorPicker',
  component: ColorPickerComponent,
  tags: ['autodocs'],
  argTypes: {
    autoclose: {
    control: 'select',
    options: ['outsideClick', 'always', 'disabled'],
    defaultValue: undefined,
  },
}
};

export default meta;
type Story = StoryObj<ColorPickerComponent>;

export const Default: Story = {
  args: {
    name: 'ColorPicker',
    placeholder: 'Select Color',
    readonly: false,
    required: false,
  },
  // Exclude `autoclose` from the Default story
  parameters: {
    controls: {
      exclude: ['autoclose'],
    },
  },
};

export const Autoclose: Story = {
  args: {
    placeholder: 'Select Color',
    autoclose:'outsideClick',
  },
};