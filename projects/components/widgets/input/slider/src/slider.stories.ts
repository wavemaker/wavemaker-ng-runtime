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

export const Default: Story = {
  args: {
    minvalue: 0,
    maxvalue: 50,
    step: 5,
    disabled: false
  },
};



export const ReadOnly : Story = {
  args :{
    minvalue:10,
    maxvalue:100,
    readonly:true
  }
};

export const datavalue : Story = {
  args:{
    minvalue :0,
    maxvalue:100,
    datavalue:10
  }
}



