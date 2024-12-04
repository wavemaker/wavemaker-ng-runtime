import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { IconComponent } from "./icon.component";

const meta: Meta<IconComponent> = {
  title: 'Input/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  argTypes: {
    iconsize: { control: 'select', options: ['Base', 'fa-lg', 'fa-2x','fa-3x', 'fa-4x','fa-5x'] },
    iconposition:{control: 'select', options:['right', 'left']},
    },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Icon: Story = {
    args: {
      iconsize: 'Base',
      iconclass: 'wi wi-plus',
    },
  
    render: (args) => {

      const iconSizeMap: Record<string, string> = {
        'Base': '',
        'fa-lg': 'fa-lg',
        'fa-2x': 'fa-2x',
        'fa-3x': 'fa-3x',
        'fa-4x': 'fa-4x',
        'fa-5x': 'fa-5x',
      };
  
      const baseIconClass = 'wi wi-plus';
      const selectedIconSize = iconSizeMap[args.iconsize] || '';
      const updatedIconClass = `${baseIconClass} ${selectedIconSize}`.trim();
  
      return {
        component: IconComponent,
        props: {
          ...args,
          iconclass: `${updatedIconClass}`,
        },
      };
    },
  };
    

  
  export const IconWithCaption: Story = {
    args: {
      caption: 'Icon',
      iconsize:'Base',
      iconclass: 'wi wi-plus',
    },
    render: (args) => {

        const iconSizeMap: Record<string, string> = {
          'Base': '',
          'fa-lg': 'fa-lg',
          'fa-2x': 'fa-2x',
          'fa-3x': 'fa-3x',
          'fa-4x': 'fa-4x',
          'fa-5x': 'fa-5x',
        };
    
        const baseIconClass = 'wi wi-plus';
        const selectedIconSize = iconSizeMap[args.iconsize] || '';
        const updatedIconClass = `${baseIconClass} ${selectedIconSize}`.trim();
    
        return {
          component: IconComponent,
          props: {
            ...args,
            iconclass: `${updatedIconClass}`,
          },
        };
      },
}
