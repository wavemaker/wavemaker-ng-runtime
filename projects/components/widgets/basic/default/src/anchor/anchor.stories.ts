import type { Meta, StoryObj } from '@storybook/angular';
import { AnchorComponent } from './anchor.component';

const meta: Meta<AnchorComponent> = {
  title: 'Form/Anchor',
  component: AnchorComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<AnchorComponent>;

export const Default: Story = {
  args: {},
};