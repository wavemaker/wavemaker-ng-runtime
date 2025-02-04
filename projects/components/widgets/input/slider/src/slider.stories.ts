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

export const AllVariants : Story = {
  render :(args)=>{
    const variants = [
      {
        heading:"Default",
        slider:{
          minvalue: 0,
          maxvalue: 50,
          step: 5,
          datavalue:10
        }
      },
      {
        heading:"Disabled",
        slider:{
          minvalue: 0,
          maxvalue: 50,
          step: 5,
          readonly: true,
          disabled:true
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
                 <span class="app-slider-value fa-pull-left">{{ ${variant.slider.minvalue} }}</span>
                <span class="app-slider-value fa-pull-right">{{ ${variant.slider.maxvalue} }}</span>
                <input 
                  type="range" class="range-input"
                  min="${variant.slider.minvalue}" 
                  max="${variant.slider.maxvalue}" 
                  step="${variant.slider.step || 1}" 
                  value="${variant.slider.datavalue || 0}" 
                  ${variant.slider.readonly ? 'readonly' : ''}
                   ${variant.slider.disabled ? 'disabled' : ''}
                   style="width:100%:"
                />
               
              </div>
            `
          )
          .join('')}
      </div>
    `,
    }
  }
}



