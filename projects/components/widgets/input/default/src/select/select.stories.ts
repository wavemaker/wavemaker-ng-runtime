import type { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'Form/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
 
  args: {
  
    datavalue: {value: 'Option 1, Option 2, Option 3'},
    placeholder:"Select Value",
    name:"",
    readonly:false,
    required:true,
    autofocus:true,
    disabled:false

  },

};


export const DatasetOptions : Story = {
  args:{
    dataset:  [
      {
        "category": "Fruits",
        "value": "Apple"
      },
      {
        "category": "Fruits",
        "value": "Banana"
      },
      {
        "category": "Vegetables",
        "value": "Carrot"
      }
    ],
    datafield:"value",
    displayfield:"value",
    // groupby:'category',
    // orderby:'value'
    
    }
  };


