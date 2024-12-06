import type { Meta, StoryObj } from '@storybook/angular';
import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Form/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = {
  args: {},
};