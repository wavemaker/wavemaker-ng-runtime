import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ButtonComponent } from './button.component';
import { trim } from 'jquery';

const meta: Meta<ButtonComponent> = {
  title: 'Input/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    class : {
      control: 'select',
      options: ['btn-default', 'btn-primary', 'btn-secondary','btn-tertiary','btn-success','btn-info','btn-warning','btn-danger'],
    },
    type: { control: 'select', options: ['small', 'medium', 'large'] },
    //badgevalue: { control: 'text' },
    //caption: { control: 'text' },    
    // disabled: { control: 'boolean' },
    // arialabel: { control: 'text' },
    // iconclass: { control: 'text' },
    // iconurl: { control: 'text' },
    // shortcutkey: { control: 'text' },
    // tabindex: { control: { type: 'number', min: 0 } },
    //iconposition: { control: { type: 'select', options: ['left', 'right', 'top', 'bottom'] } },
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

export const Filled: Story = {
  args: {
    caption: 'Filled(btn-filled)',
    class: 'btn-filled',
    type:'medium',
    disabled: false,
    badgevalue: '2',
    iconclass: 'wi wi-plus',
    iconposition: 'left'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-filled';
    const buttonSize = buttonSizeMap[args.type] || '';
    const updatedClass = `${baseClass} ${args.class || ''} ${buttonSize}`.trim();

    return {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
    };
  },
};


export const Outlined: Story = {
  args: {
    caption: 'Outlined(btn-outlined)',
    class: 'btn-outlined',
    type:'small',
    disabled: true,
    badgevalue: '2',
    iconclass: 'wi wi-plus',
    iconposition: 'right'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-outlined';
    const buttonSize = buttonSizeMap[args.type] || '';
    const updatedClass = `${baseClass} ${args.class || ''} ${buttonSize}`.trim();

    return {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
    };
  },
};


export const Text: Story = {
  args: {
    caption: 'Text(btn-text)',
    class: 'btn-text',
    type:'large',
    disabled: false,
    badgevalue: '2',
    iconclass: 'wi wi-plus',
    iconposition: 'left'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-filled';
    const buttonSize = buttonSizeMap[args.type] || '';
    const updatedClass = `${baseClass} ${args.class || ''} ${buttonSize}`.trim();

    return {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
    };
  },
};


export const Elevated: Story = {
  args: {
    caption: 'Elevated(btn-elevated)',
    class: 'btn-elevated',
    type:'medium',
    disabled: false,
    badgevalue: '2',
    iconclass: 'wi wi-plus',
    iconposition: 'left'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-filled';
    const buttonSize = buttonSizeMap[args.type] || '';
    const updatedClass = `${baseClass} ${args.class || ''} ${buttonSize}`.trim();

    return {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
    };
  },
};

