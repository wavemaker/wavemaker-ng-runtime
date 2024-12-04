import type { Meta, StoryObj } from '@storybook/angular';
import { NumberComponent } from './number.component';

const meta: Meta<NumberComponent> = {
  title: 'Input/Number',
  component: NumberComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<NumberComponent>;

export const Primary: Story = {
  args: {
    minvalue: 0,
    maxvalue: 100,
    datavalue: 10,
    readonly: false
  },
};