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

export const AllVariants: Story = {
  render:(args)=>{
    const variants = [{
      heading:"Default",
      number:{
        placeholder: 'Enter Number here',
        minvalue: 0,
        maxvalue: 100,
        disabled: false,
      readonly: false,
     
      }
    },
    {
      heading:"Disabled",
      number:{
        placeholder: 'Enter Number here',
        datavalue: 10,
        disabled: true,
      readonly: true,
     
      }
    },
    {
      heading:"Min/Max Boundaries",
      number:{
        required:true,
        maxvalue: 10,
        minvalue: 2,
        datavalue :5
    
      }
    },
    {
      heading:"Step up",
      number:{
        placeholder: 'Enter Number here',
        disabled: false,
      readonly: false,
      step:10,
      }
    },
    {
    heading:"With Trailing zeroes",
    number:{
      placeholder: 'Enter Number here',
      inputmode:"natural",
      decimalplaces:2,
      trailingzero:false
  
    }
  },
  {
    heading:"Without Trailing zeroes",
    number:{
      placeholder: 'Enter Number here',
      inputmode:"natural",
      trailingzero:true
  
    }
  },
  {
    heading:"Hint",
    number:{
      placeholder: 'Enter Number here',
      inputmode:"natural",
      trailingzero:true,
      hint:'Enter between 0-9'
  
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
                  <input  class="form-control app-textbox app-number-input"
                    type="number" 
                    placeholder="${variant.number.placeholder}" 
                    value="${variant.number.datavalue || ''}" 
                    ${variant.number.readonly ? 'readonly' : ''}
                    ${variant.number.disabled ? 'disabled' : ''}
                    ${variant.number.required ? 'required' : ''}
                    ${variant.number.maxvalue ? `max="${variant.number.maxvalue}"` : ''}
                    ${variant.number.minvalue ? `min="${variant.number.minvalue}"` : ''}
                    ${variant.number.step ? `step="${variant.number.step}"` : ''}
                    ${variant.number.inputmode ? `inputmode="${variant.number.inputmode}"` : ''}
                    ${variant.number.trailingzero === false ? `style="appearance: none; -moz-appearance: textfield;"` : ''}
                    ${variant.number.decimalplaces ? `data-decimalplaces="${variant.number.decimalplaces}"` : ''}
                  />
                  <span>${variant.number.hint || ''}</span>
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