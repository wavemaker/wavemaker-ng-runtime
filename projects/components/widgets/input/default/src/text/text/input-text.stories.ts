import type { Meta, StoryObj } from '@storybook/angular';
import { InputTextComponent } from './input-text.component';

const meta: Meta<InputTextComponent> = {
  title: 'Input/Text',
  component: InputTextComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<InputTextComponent>;

export const Primary: Story = {
  args: {
  
    datavalue: "Sampele Text",
    autofocus: true,
    class: "primary",
    disabled: false,

  },
};