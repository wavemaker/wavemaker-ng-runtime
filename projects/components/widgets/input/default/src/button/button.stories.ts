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
    iconposition: { control: 'select', options: ['left', 'right', 'top'] },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Filled: Story = {
  args: {
    caption: 'Filled',
    class: 'btn-filled',
    type:'medium',
    iconposition: 'left',
    iconclass: 'wi wi-plus',
    badgevalue: '2'
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
    caption: 'Outlined',
    class: 'btn-outlined',
    type:'small',
    iconposition: 'right',
    iconclass: 'wi wi-plus',
    badgevalue: '2'

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
    caption: 'Text',
    class: 'btn-text',
    type:'large',
    iconposition: 'left',
    iconclass: 'wi wi-plus',
    badgevalue: '2'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-text';
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
    caption: 'Elevated',
    class: 'btn-elevated',
    type:'medium',
    iconposition: 'left',
    iconclass: 'wi wi-plus',
    badgevalue: '2'
  },
  render: (args) => {

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const baseClass = 'btn-elevated';
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

