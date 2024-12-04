import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Input/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    class : {
      control: 'select',
      options: ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-info'],
    },
    //badgevalue: { control: 'text' },
    //caption: { control: 'text' },    
    // disabled: { control: 'boolean' },
    // arialabel: { control: 'text' },
    // iconclass: { control: 'text' },
    // iconurl: { control: 'text' },
    // shortcutkey: { control: 'text' },
    // tabindex: { control: { type: 'number', min: 0 } },
    //iconposition: { control: { type: 'select', options: ['left', 'right', 'top', 'bottom'] } },
    //type: { control: { type: 'select', options: ['button', 'submit', 'reset'] } },
    //animation: { control: 'text' },
    //class: { control: 'text' },
    //conditionalclass: { control: 'object' },
    //conditionalstyle: { control: 'object' },
    //iconheight: { control: 'text' },
    //iconmargin: { control: 'text' },
    //hint: { control: 'text' },
    //iconwidth: { control: 'text' },
    //name: { control: 'text' },
    //show: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;


export const FilledButton: Story = {
  args: {
    caption: 'Filled Button (btn-filled)',
    class: 'btn-filled',
    disabled: false,
    // type: 'button',
    // iconclass: 'wi wi-plus',
    // iconposition: 'left',
  },
  argTypes: {
    class: {
      table: {
        category: 'Customization',
      },
    },
  },
  play: async ({ args, updateArgs }) => {
    args.class = `btn-filled ${args.class}`;
    updateArgs({ class: args.class });
  },
};

export const OutlinedButton: Story = {
  args: {
    caption: 'Outlined Button (btn-outlined)',
    class: 'btn-outlined',
    disabled: false,
    // type: 'button',
    // iconclass: 'wi wi-plus',
    // iconposition: 'left',
  },
  argTypes: {
    class: {
      table: {
        category: 'Customization',
      },
    },
  },
  play: async ({ args, updateArgs }) => {
    args.class = `btn-outlined ${args.class}`;
    updateArgs({ class: args.class });
  },
};

export const TextButton: Story = {
  args: {
    caption: 'Text Button (btn-text)',
    class: 'btn-text',
    disabled: false,
    // type: 'button',
    // iconclass: 'wi wi-plus',
    // iconposition: 'left',
  },
  argTypes: {
    class: {
      table: {
        category: 'Customization',
      },
    },
  },
  play: async ({ args, updateArgs }) => {
    args.class = `btn-text ${args.class}`;
    updateArgs({ class: args.class });
  },
};

export const ElevatedButton: Story = {
  args: {
    caption: 'Elevated Button (btn-elevated)',
    class: 'btn-elevated',
    disabled: false,
    // type: 'button',
    // iconclass: 'wi wi-plus',
    // iconposition: 'left',
  },
  argTypes: {
    class: {
      table: {
        category: 'Customization',
      },
    },
  },
  play: async ({ args, updateArgs }) => {
    args.class = `btn-elevated ${args.class}`;
    updateArgs({ class: args.class });
  },
};