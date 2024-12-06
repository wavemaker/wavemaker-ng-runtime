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

export const Default: Story = {
  args: {
    disabled: false,
    dataset: ['Option 1', 'Option 2', 'Option 3'],
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
    dataset: ['Option A', 'Option B', 'Option C'],
  },
};

export const Disabled: Story = {
  args: {
    dataset: ['Disabled 1', 'Disabled 2', 'Disabled 3'],
    disabled: true,
  },
};

export const Orderby: Story = {
  args: {
    dataset: [
      { category: 'Fruits', value: 'Apple' },
      { category: 'Vegetables', value: 'Carrot' },
      { category: 'Fruits', value: 'Banana' },
    ],
    displayfield: 'value',
    orderby: 'value:desc',
  },
};

export const Groupby: Story = {
  args: {
    dataset: [
      { category: 'Fruits', value: 'Apple' },
      { category: 'Fruits', value: 'Banana' },
      { category: 'Vegetables', value: 'Carrot' },
    ],
    displayfield: 'value',
    groupby: 'category',
  },
};