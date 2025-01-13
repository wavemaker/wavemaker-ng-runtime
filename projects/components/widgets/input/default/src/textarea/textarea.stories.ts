import type { Meta, StoryObj } from '@storybook/angular';
import { TextareaComponent } from './textarea.component';

const meta: Meta<TextareaComponent> = {
  title: 'Form/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: {
    datavalue: '',
    placeholder: 'Enter your name here',
    disabled: false,
    readonly :false
  },
};

export const MaxCharacters: Story = {
  args: {
    datavalue: '',
    maxchars: 100,
    placeholder: 'Maximum 100 characters',
  },
};

// export const Hint: Story = {
//   args: {
//     datavalue: '',
//     placeholder: 'Enter your name here',
//     hint: 'This is a hint for the user', //on hover need to check
//   },
// };

export const AllVariants: Story ={
  render : (args)=>{
    const variants = [
      {
        heading:"Default",
        textarea:{
          datavalue: '',
          placeholder: 'Enter your name here',
          disabled: false,
          readonly :false
        }
      },
      {
        heading:"Disabled",
        textarea:{
          datavalue: '',
          placeholder: 'Enter your name here',
          disabled: true,
          readonly :true
        }
      },
      {
        heading:"Max Characters",
        textarea:{
          datavalue: '',
    maxchars: 100,
    placeholder: 'Maximum 100 characters',
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
                <textarea 
                  class="form-control app-textbox"
                  placeholder="${variant.textarea.placeholder}"
                  [disabled]="${variant.textarea.disabled}"
                  [readonly]="${variant.textarea.readonly}"
                  maxlength="${variant.textarea.maxchars || ''}"
                >
                ${variant.textarea.datavalue}
                </textarea>
              </div>
            `
          )
          .join('')}
      </div>
    `,
    }
  }
}

