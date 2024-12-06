import type { Meta, StoryObj } from '@storybook/angular';
import { InputTextComponent } from './input-text.component';

const meta: Meta<InputTextComponent> = {
  title: 'Form/Text',
  component: InputTextComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<InputTextComponent>;

export const Placeholder: Story = {
  args: {
    datavalue: '',
    placeholder: 'Enter your name here',
    disabled: false,
    readonly: false,
  },
};

export const Validation: Story = {
  args: {
    datavalue: '',
    regexp: '^[a-zA-Z0-9]+$',
    required: true,
    placeholder: 'Enter alphanumeric',
  },
};

export const MaxCharacters: Story = {
  args: {
    datavalue: '',
    maxchars: 10,
    placeholder: 'Up to 10 chars',
  },
};

export const CustomFormat: Story = {
  args: {
    datavalue: "1234567890",
    displayformat: '(999) 999-9999',
    maskVal: '(000) 000-0000',
    showdisplayformaton: 'always',
  },
};
