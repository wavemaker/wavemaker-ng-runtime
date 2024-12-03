import type { Meta, StoryObj } from '@storybook/angular';
import { InputCalendarComponent } from './input-calendar.component';

const meta: Meta<InputCalendarComponent> = {
  title: 'Input/Calendar',
  component: InputCalendarComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<InputCalendarComponent>;

export const Primary: Story = {
  args: {
    autofocus: true,
    autocomplete: true
  },
};