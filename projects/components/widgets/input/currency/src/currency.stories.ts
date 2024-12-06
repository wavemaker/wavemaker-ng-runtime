import type { Meta, StoryObj } from '@storybook/angular';
import { CurrencyComponent } from './currency.component';

const meta: Meta<CurrencyComponent> = {
  title: 'Form/Currency',
  component: CurrencyComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<CurrencyComponent>;

export const Default: Story = {
  args: {},
};