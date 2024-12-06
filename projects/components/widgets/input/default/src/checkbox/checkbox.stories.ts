import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Form/Checkbox',
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
    _caption: "checkbox",
    class: 'secondary',
    disabled: false,
    readonly : false,
    required : false

  },
  // Exclude `class` from the Default story
  parameters: {
    controls: {
      exclude: ['class'],
    },
  },
};

export const Class: Story = {
  args: {
    _caption: "checkbox",
    datavalue : true,
    disabled: true,
    class: 'secondary',
  },
};