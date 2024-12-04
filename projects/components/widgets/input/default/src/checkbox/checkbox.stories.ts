import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Input/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  args: {
    _caption: "Label",
    disabled: true,
  },
};

export const Secondary: Story = {
  args: {
    _caption: "Label",
    class: "secondary"
  },
};

export const Success: Story = {
  args: {
    _caption: "Label",
    class: "success"
  },
};

export const Error: Story = {
  args: {
    _caption: "Label",
    class: "error"
  },
};