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
    dataset : ['yes', 'no', 'maybe'],
  },
};

export const Required: Story = {
  args: {
    required: true,
    dataset: ['yes', 'no', 'maybe'],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    dataset: ['yes', 'no', 'maybe'],
  },
};
export const DisplayfieldChange: Story = {
  args: {
    disabled: false,
    dataset: [
      { "name": "John Doe", "location": "New York, USA" },
      { "name": "Jane Smith", "location": "London, UK" },
      { "name": "Michael Johnson", "location": "Sydney, Australia" },
      { "name": "Emily Davis", "location": "Toronto, Canada" },
      { "name": "David Williams", "location": "Berlin, Germany" }
    ],
    displayfield : "location"
  },
};


