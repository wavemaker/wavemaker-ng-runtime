import type { Meta, StoryObj } from '@storybook/angular';
import { ListComponent } from './list.component';

const meta: Meta<ListComponent> = {
  title: 'Data/List',
  component: ListComponent,
  tags: ['autodocs'],
  argTypes: {
    disableitem: { control: 'boolean' },
    name: { control: 'text' },
    dataset: { control: 'object' },
    multiselect: { control: 'boolean' },
    selectfirstitem: { control: 'boolean' },
    orderby: { control: 'text' },
    itemsperrow: { control: 'text' },
    enablereorder: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ListComponent>;

export const Default: Story = {
  args: {
    disableitem: false,
    name: 'Default List',
    dataset: ['Item 1', 'Item 2', 'Item 3'],
  },
};

// export const MultiSelectEnabled: Story = {
//   args: {
//     disableitem: false,
//     name: 'MultiSelect List',
//     dataset: ['Item A', 'Item B', 'Item C'],
//     multiselect: true,
//   },
// };

// export const OrderedList: Story = {
//   args: {
//     disableitem: false,
//     name: 'Ordered List',
//     dataset: ['Item X', 'Item Y', 'Item Z'],
//     orderby: 'asc',
//   },
// };

// export const GridView: Story = {
//   args: {
//     disableitem: false,
//     name: 'Grid View List',
//     dataset: ['Grid 1', 'Grid 2', 'Grid 3', 'Grid 4'],
//     itemsperrow: "2",
//   },
// };

// export const ReorderableList: Story = {
//   args: {
//     disableitem: false,
//     name: 'Reorderable List',
//     dataset: ['Drag 1', 'Drag 2', 'Drag 3'],
//     enablereorder: true,
//   },
// };
