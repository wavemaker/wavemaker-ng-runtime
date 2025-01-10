import type { Meta, StoryObj } from '@storybook/angular';
import { CurrencyComponent } from './currency.component';
import { ReadOnly } from '../../slider/src/slider.stories';


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


export const AllVariants : Story = {
  render :(args)=>{
    const variants = [{
    heading:'Default',
    currencies:{
      placeholder: 'Enter value',
      readonly: false,
      required: true,
      disabled: false,

    }
    },
    {
      heading:'Disabled',
      currencies:{
        placeholder: 'Enter value',
        readonly: true,
        required: true,
        disabled: true,
      }
      },
    {
      heading:'Min/Max Boundaries',
      currencies:{
        placeholder: 'Enter value',
        maxvalue: 5000,
        minvalue: 500,
        readonly: false,
        required:true
      

      }
      },
      {
        heading:'Natural Mode',
        currencies:{
         placeholder: 'Enter value',
          inputmode: 'natural'
        }
        },
        {
          heading:'Financial Mode',
          currencies:{
           placeholder: 'Enter value',
            inputmode: 'financial'
          }
          },
          {
            heading:'Step Up',
            currencies:{
             placeholder: 'Enter value',
              step:100,
           
            }
            },
    
  ]
  return {
    template: `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${variants
        .map(
          (variant) => `
          <div>
            <h6>${variant.heading}</h6>
            <div style="display: flex; gap: 16px; align-items: center;">
              <input class="form-control app-textbox app-currency-input"
                type="number" 
                placeholder="${variant.currencies.placeholder}" 
                ${variant.currencies.readonly ? 'readonly' : ''}
                ${variant.currencies.disabled ? 'disabled' : ''}
                ${variant.currencies.required ? 'required' : ''}
                ${variant.currencies.maxvalue ? `max="${variant.currencies.maxvalue}"` : ''}
                ${variant.currencies.minvalue ? `min="${variant.currencies.minvalue}"` : ''}
                ${variant.currencies.step ? `step="${variant.currencies.step}"` : ''}
                ${variant.currencies.inputmode ? `inputmode="${variant.currencies.inputmode}"` : ''}
                
              />
            </div>
          </div>
        `
        )
        .join('')}
    </div>
  `,
};
},
};