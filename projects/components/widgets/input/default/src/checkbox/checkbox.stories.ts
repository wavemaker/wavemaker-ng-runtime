import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Input/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    class : {
      control: 'select',
      options: ['secondary', 'success', 'error'],
    }
  }
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  args: {
    _caption: "Label",
    class: 'secondary',
    disabled: false,
  },
};