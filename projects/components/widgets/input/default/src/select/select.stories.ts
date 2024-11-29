import type { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'Input/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Primary: Story = {
  args: {
    dataset: [],
  },
};