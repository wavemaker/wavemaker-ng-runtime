import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Form/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  args: {},
};