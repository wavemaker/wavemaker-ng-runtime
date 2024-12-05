import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ChipsComponent } from './chips.component';

const meta: Meta<ChipsComponent> = {
  title: 'Form/Chips',
  component: ChipsComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<ChipsComponent>;

export const Default: Story = {
  args: {
  },
};