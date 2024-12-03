import type { Meta, StoryObj } from '@storybook/angular';
import { RadiosetComponent } from './radioset.component';

const meta: Meta<RadiosetComponent> = {
  title: 'Input/Radioset',
  component: RadiosetComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<RadiosetComponent>;

export const Primary: Story = {
  args: {
    disabled: false,
    dataset: { value: "User 1, User 2, User 3" }
  },
};