import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { SliderComponent } from './slider.component';

const meta: Meta<SliderComponent> = {
  title: 'Form/Slider',
  component: SliderComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SliderComponent>;

export const Primary: Story = {
  args: {
    minvalue: 0,
    maxvalue: 200,
    step: 10,
    disabled: false },
};

export const Secondary: Story = {
  args: {
    minvalue: 0,
    maxvalue: 50,
    step: 5,
    disabled: true
  },
};