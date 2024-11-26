import type { Meta, StoryObj } from '@storybook/angular';
import { TextfieldComponent } from './textfield.component';

const meta: Meta<TextfieldComponent> = {
  title: 'Custom/Text',
  component: TextfieldComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<TextfieldComponent>;
export const Primary: Story = {
  args: {
    style: "Outlined"
  },
};

export const Secondary: Story = {
  args: {
    style: "Filled"
  },
};
