import type { Meta, StoryObj } from '@storybook/angular';
import { InputTextComponent } from './input-text.component';

const meta: Meta<InputTextComponent> = {
  title: 'Form/Text',
  component: InputTextComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<InputTextComponent>;

export const Placeholder: Story = {
  args: {
    datavalue: '',
    placeholder: 'Enter your name here',
    disabled: false,
    readonly: false,
  },
};

export const Validation: Story = {
  args: {
    datavalue: '',
    regexp: '^[a-zA-Z0-9]+$',
    required: true,
    placeholder: 'Enter alphanumeric',
  },
};

export const MaxCharacters: Story = {
  args: {
    datavalue: '',
    maxchars: 10,
    placeholder: 'Up to 10 chars',
  },
};

export const CustomFormat: Story = {
  args: {
    datavalue: "1234567890",
    displayformat: '(999) 999-9999',
    maskVal: '(000) 000-0000',
    showdisplayformaton: 'always',
  },
};

export const AllVariants: Story = {
render:(args)=>{
  const variants = [
    {
      heading:"Default",
      text:{
        datavalue: '',
        placeholder: 'Enter your text here',
        disabled: false,
        readonly: false,
      }

    },
    {
      heading:"Disabled",
      text:{
        datavalue: '',
        placeholder: 'Enter your text here',
        disabled: true,
        readonly: true,
      }

    },
    {
      heading:"Validation",
      text:{
        datavalue: '',
    regexp: '^[a-zA-Z0-9]+$',
    required: true,
    placeholder: 'Enter alphanumeric',
      }

    },
    {
      heading:"Max Characters",
      text:{
        datavalue: '',
        maxchars: 10,
        placeholder: 'Up to 10 chars',
      }

    },
    {
      heading:"Custom Format",
      text:{
        datavalue: "1234567890",
        displayformat: '(999) 999-9999',
        maskVal: '(000) 000-0000',
        showdisplayformaton: 'always',
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
              <input 
                class="form-control app-textbox"
                type="text"
                placeholder="${variant.text.placeholder}"
                ${variant.text.disabled ? 'disabled' : ''}
                ${variant.text.readonly ? 'readonly' : ''}
                ${variant.text.required ? 'required' : ''}
                pattern="${variant.text.regexp  || ''}"
                maxlength="${variant.text.maxchars || ''}"
                value="${variant.text.datavalue || ''}"
                
                    
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
