import type { Meta, StoryObj } from '@storybook/angular';
import { InputColorComponent } from './input-color.component';

const meta: Meta<InputColorComponent> = {
  title: 'Form/Color',
  component: InputColorComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<InputColorComponent>;

export const Primary: Story = {
  args: {
    autofocus: true,
  },
};