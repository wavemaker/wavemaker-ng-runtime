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

export const Primary: Story = {
  args: {
    _caption: "Sample",
    disabled: true,
  },
};