import type { Meta, StoryObj } from '@storybook/angular';
import { CurrencyComponent } from './currency.component';


const meta: Meta<CurrencyComponent> = {
  title: 'Form/Currency',
  component: CurrencyComponent,
  tags: ['autodocs'],
  argTypes: {
    inputmode: {
      control: 'select',
      options:['natural','financial']
    }
    // currency: {
    //   control: 'select',
    //   options: ['INR','USD']
    // }
  },
  parameters: {
    controls: {
      exclude: ['inputmode']
    }
  }
};

export default meta;
type Story = StoryObj<CurrencyComponent>;


export const Default: Story = {
  args: {
    placeholder: 'Enter value',
    readonly: false,
    required: true,
    disabled: false,
  } 
};

export const MaxMinValue: Story = {
  args: {
    placeholder: 'Enter value',
    maxvalue: 5000,
    minvalue: 500
  }
};

export const WithStep: Story = {
  args: {
    placeholder: 'Enter value',
    step: 100,
  }
};


export const inputmode: Story = {
  args: {
    placeholder: 'Enter value',
    inputmode: 'natural'
  },
  parameters: {
    controls: {
      exclude: []
    }
  }
};

// export const WithTrailingZero: Story = {
//   args: {
//     placeholder: 'Enter value',
//     trailingzero: true
//   }
// };
