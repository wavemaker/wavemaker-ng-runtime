import type { Meta, StoryObj } from '@storybook/angular';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Form/Switch',
  component: SwitchComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
  args: {
    disabled: false,
    required: false,
    dataset : ['yes', 'no', 'maybe'],
  },
};

export const DisplayfieldChange: Story = {
  args: {
    disabled: false,
    dataset: [
      { 'name': 'John Doe', 'location': 'New York, USA' },
      { 'name': 'Jane Smith', 'location': 'London, UK' },
      { 'name': 'Michael Johnson', 'location': 'Sydney, Australia' },
      { 'name': 'Emily Davis', 'location': 'Toronto, Canada' },
      { 'name': 'David Williams', 'location': 'Berlin, Germany' }
    ],
    displayfield : 'location'
  },
};

export const Orderby: Story = {
  args: {
    disabled: false,
    dataset: [
      { 'name': 'John Doe', 'location': 'New York, USA' },
      { 'name': 'Jane Smith', 'location': 'London, UK' },
      { 'name': 'Michael Johnson', 'location': 'Sydney, Australia' },
      { 'name': 'Emily Davis', 'location': 'Toronto, Canada' },
      { 'name': 'David Williams', 'location': 'Berlin, Germany' }
    ],
    displayfield : 'location',
    orderby : 'location:asc',
  },
};

// export const AllVariants: Story = {
//   render: (args) => {
//     const variants = [
//       {
//         heading: 'Filled Switches',
//         switches: [
//           { label: 'Primary', class: 'btn-primary btn-primary', checked: true },
//           { label: 'Success', class: 'switch-filled-success', checked: false },
//           { label: 'Warning', class: 'switch-filled-warning', checked: false },
//           { label: 'Danger', class: 'switch-filled-danger', checked: true },
//           { label: 'Neutral', class: 'switch-filled-neutral', checked: false },
//         ],
//         layout: 'grid',
//       },
//       // Add other variants if needed
//     ];

//     return {
//       props: { ...args },
//       template: `
//         <div style="display: flex; flex-direction: column; gap: 24px;">
//           ${variants
//             .map((variant) => {
//               const isGridLayout = variant.layout === 'grid';
//               return `
//                 <div>
//                   <h6>${variant.heading}</h6>
//                   <div style="
//                   display: ${isGridLayout ? 'grid' : 'flex'};
//                     ${isGridLayout ? 'grid-template-columns: repeat(3, 1fr); column-gap: 15px; row-gap: 15px;' : 'gap: 8px;'}
//                   ">
//                     ${variant.switches
//                       .map((switchItem) => {
//                         return `
//                           <div style="display: flex; align-items: center; gap: 8px;">
//                             <label>${switchItem.label}</label>
//                             <app-switch
//                               class="${switchItem.class}"
//                               [checked]="${switchItem.checked}"
//                             ></app-switch>
//                           </div>
//                         `;
//                       })
//                       .join('')}
//                   </div>
//                 </div>
//               `;
//             })
//             .join('')}
//         </div>
//       `,
//     };
//   },
// };