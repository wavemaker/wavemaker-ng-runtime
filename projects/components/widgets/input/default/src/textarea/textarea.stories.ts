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

