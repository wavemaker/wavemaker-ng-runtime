import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';
import { fn } from '@storybook/test';

const meta: Meta<CardComponent> = {
  title: 'Data/Card',
  component: CardComponent,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Title of the card' },
    subheading: { control: 'text', description: 'Subheading text' },
    iconclass: { control: 'text', description: 'CSS class for the icon' },
    iconurl: { control: 'text', description: 'URL of the icon image' },
    actions: { control: 'text', description: 'Actions available for the card' },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Basic: Story = {
  args: {
    title: 'Card Title',
    subheading: 'Card Subheading',
    iconclass: 'fa fa-user',
    actions: 'Edit, Delete',
  },
};

// export const WithIcon: Story = {
//   args: {
//     title: 'User Profile',
//     subheading: 'Personal details',
//     iconclass: 'fa fa-user-circle',
//   },
// };

// export const WithImage: Story = {
//   args: {
//     title: 'Nature View',
//     subheading: 'Beautiful Scenery',
//     iconurl: 'https://via.placeholder.com/150',
//   },
// };




// import type { Meta, StoryObj } from '@storybook/angular';
// import { fn } from '@storybook/test';
// import { CardComponent } from './card.component';


// const meta: Meta<CardComponent> = {
//   title: 'Data/Card',
//   component: CardComponent,
//   tags: ['autodocs'],
// //   argTypes: {
// //     iconsize: { control: 'select', options: ['Base', 'fa-lg', 'fa-2x','fa-3x', 'fa-4x','fa-5x'] },
// //     iconposition:{control: 'select', options:['right', 'left']},
// //     },
// };

// export default meta;
// type Story = StoryObj<CardComponent>;

// export const WithCustomApplicationProvider: Story = {
//   render: () => ({
//     // Apply application config to a specific story
    
//   })
// }

