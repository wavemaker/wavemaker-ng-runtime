import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ChipsComponent } from './chips.component';

const meta: Meta<ChipsComponent> = {
  title: 'Form/Chips',
  component: ChipsComponent,
  tags: ['autodocs'],
  argTypes: {
    inputposition: { control: 'select', options: ['last', 'first'] },
  }
};

export default meta;
type Story = StoryObj<ChipsComponent>;

export const Default: Story = {
  args: {
    dataset: ['Option 1', 'Option 2', 'Option 3'],
    readonly: false,
    inputposition: 'last',
    //placeholder: 'Type here...',
    //show: true,
    //disabled: false,
  },
};

export const Reorder: Story = {
  args: {
    dataset: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    enablereorder: true,
  },
};

export const LimitedChips: Story = {
  args: {
    dataset: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
    limit: 1,
    inputposition: "first"
  },
};

export const SelectionOnly: Story = {
  args: {
    dataset: ['Option 1', 'Option 2', 'Option 3'],
    allowonlyselect: true,
    inputposition: "last"
  },
};


export const Orderby: Story = {
  args: {
    dataset: [
      { 'name': 'John', 'email': 'john.doe@wm.com' },
      { 'name': 'Jane Smith', 'email': 'jane.smith@wm.com' },
      { 'name': 'Michael Johnson', 'email': 'michael.johnson@wm.com' },
      { 'name': 'Emily Davis', 'email': 'emily.davis@wn.com' },
      { 'name': 'John', 'email': 'john.davis@wm.com' }
    ],
    displayfield:'name',
    searchkey: 'email,name',
    orderby:'name:desc',
  },
};


// export const Groupby: Story = {
//   args: {
//     dataset: [
//       { 'name': 'John', 'email': 'john.doe@wm.com' },
//       { 'name': 'Jane Smith', 'email': 'jane.smith@wm.com' },
//       { 'name': 'Michael Johnson', 'email': 'michael.johnson@wm.com' },
//       { 'name': 'Emily Davis', 'email': 'emily.davis@wn.com' },
//       { 'name': 'John', 'email': 'john.davis@wm.com' }
//     ],
//     displayfield:'name',
//     searchkey: 'email,name',
//     groupby:'name',
//   },
// };