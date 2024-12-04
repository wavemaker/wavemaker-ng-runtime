import type { Meta, StoryObj } from '@storybook/angular';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Input/Switch',
  component: SwitchComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Primary: Story = {
  args: {
    disabled: false,
  },
};