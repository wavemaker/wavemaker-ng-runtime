import type { Meta, StoryObj } from '@storybook/angular';
import { NumberComponent } from './number.component';

const meta: Meta<NumberComponent> = {
  title: 'Form/Number',
  component: NumberComponent,
  tags: ['autodocs'],
  argTypes: {
    inputmode: { control: 'select', options: ['natural', 'financial'] },
  }
};

export default meta;
type Story = StoryObj<NumberComponent>;

export const Default: Story = {
  args: {
    placeholder: 'EnterNumber here',
      minvalue: 0,
      maxvalue: 100,
      datavalue: 10,
      disabled: false,
    readonly: false,
    hint:"Enter number",
    step:1,
      
    },
    parameters: {
      controls: {
        exclude: ['inputmode'],
      },
    },


};





export const validation: Story = {
  args: {
   required:true,
    maxvalue: 10,
    minvalue: 2,
    datavalue :5

  },
  parameters: {
    controls: {
      exclude: ['inputmode'],
    },
  },

};

export const InputMode: Story = {
  args: {
   inputmode:"natural",
   decimalplaces:2,
   trailingzero:false
  },
};

