import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import iconsData from './iconsList.json';
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
    argTypes: {
      iconposition: { table: { disable: true } },
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
    
      const selectedIconSize = iconSizeMap[args.iconsize] || '';
      const updatedIconClass = `${args.iconclass} ${selectedIconSize}`.trim();
    
      return {
        component: IconComponent,
        props: {
          ...args,
          iconclass: updatedIconClass,
        },
      };
    }, 
  };
    

export const IconWithCaption: Story = {
    args: {
      caption: 'Icon',
      iconsize:'Base',
      iconclass: 'wi wi-plus',
      iconposition : 'left'

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
    
        const selectedIconSize = iconSizeMap[args.iconsize] || '';
        const updatedIconClass = `${args.iconclass} ${selectedIconSize}`.trim();
    
        return {
          component: IconComponent,
          props: {
            ...args,
            iconclass: `${updatedIconClass}`,
          },
        };
      },
}

export const AllIcons: Story = {
  args: {
    iconsize: 'Base',
  },
  argTypes: {
    iconposition: { table: { disable: true } },
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

    const selectedIconSize = iconSizeMap[args.iconsize] || '';
   
    const createIconElements = (iconList, type) => {
      return iconList
        .map((icon) => {
          let iconClass = '';
          
          // check icon type
          if (type === 'regular') {
            iconClass = `wm-sl-r sl-${icon} ${selectedIconSize}`;
          } else if (type === 'waveicon') {
            iconClass = `mi mi-${icon} ${selectedIconSize}`;
          } else if (type === 'light') {
            iconClass = `wm-sl-l sl-${icon} ${selectedIconSize}`;
          } else if (type === 'awesome') {
            iconClass = `fa fa-${icon} ${selectedIconSize}`;
          }

          return `
            <div class="icon-item">
              <i class="${iconClass}"></i>
              <div class="icon-caption">${icon}</div>
            </div>
          `;
        })
        .join('');
    };

    return {
      template: `
        <div class="icon-section">
          <h3 class="section-title">Light</h3>
          <div class="icon-grid">
            ${createIconElements(iconsData.iconLight, 'light')}
          </div>
          <h3 class="section-title">Regular</h3>
          <div class="icon-grid">
            ${createIconElements(iconsData.iconRegular, 'regular')}
          </div>
          <h3 class="section-title">Waveicon</h3>
          <div class="icon-grid">
            ${createIconElements(iconsData.iconWavicon, 'waveicon')}
          </div>
          <h3 class="section-title">Awesome</h3>
          <div class="icon-grid">
            ${createIconElements(iconsData.iconAwesome, 'awesome')}
          </div>
        </div>
      `,
      styles: [`
        .icon-section {
          margin-bottom: 20px;
        }
        .section-title {
          text-align: left;
          font-size: 18px;
          margin: 20px 0 10px;
          color: #333;
        }
        .icon-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 20px;
          padding: 20px;
        }
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 10%;
          max-width: 80px;
          text-align: center;
        }
        .icon-caption {
          margin-top: 8px;
          font-size: 12px;
          color: #555;
        }
        @media (max-width: 768px) {
          .icon-item {
            width: 20%;
          }
        }
        @media (max-width: 480px) {
          .icon-item {
            width: 25%;
          }
        }
      `],
    };
  },
};



export const AllVariants: Story = {
  parameters: {
    actions: { disable: true },
    controls: { disable: true },
    backgrounds: { disable: true },
    interactions: { disable: true },
    'storybook/visual-tests': { disable: true },
    'storybook/css-tokens/panel': { disable: true },  // Disable CSS Variables panel for this story
  },
  render: (args) => {
    const variants = [
      {
        heading: 'Icons',
        icons: [
          { class: 'fa fa-home label-primary', size: 'fa-lg', tooltip: 'Home' },
          { class: 'fa fa-user label-primary label-success', size: 'fa-2x', tooltip: 'User' },
          { class: 'fa fa-envelope label-warning', size: 'fa-3x', tooltip: 'Envelope' },
          { class: 'fa fa-cog label-danger', size: 'fa-4x', tooltip: 'Settings' },
          { class: 'fa fa-adjust label-neutral', size: 'fa-5x', tooltip: 'Adjust' },
        ],
        showCaptions: false,
        iconPosition: 'right',
      },
      {
        heading: 'Icons With Caption',
        icons: [
          { class: 'fa fa-home label-primary', size: 'fa-lg', tooltip: 'Home' },
          { class: 'fa fa-user label-primary label-success', size: 'fa-2x', tooltip: 'User' },
          { class: 'fa fa-envelope label-warning', size: 'fa-3x', tooltip: 'Envelope' },
          { class: 'fa fa-cog label-danger', size: 'fa-4x', tooltip: 'Settings' },
          { class: 'fa fa-adjust label-neutral', size: 'fa-5x', tooltip: 'Adjust' },
        ],
        showCaptions: true,
        iconPosition: 'right',
      },
    ];

    const iconSizeMap: Record<string, string> = {
      'fa-lg': 'font-size: 18px;',
      'fa-2x': 'font-size: 24px;',
      'fa-3x': 'font-size: 32px;',
      'fa-4x': 'font-size: 40px;',
      'fa-5x': 'font-size: 48px;',
    };

    return {
      template: `
        <div style="display: flex; flex-direction: column; gap: 32px;">
          ${variants
            .map((variant) => {
              return `
                <div>
                  <h3 style="margin-bottom: 16px;">${variant.heading}</h3>
                  <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 20px;
                  ">
                    ${variant.icons
                      .map((icon) => {
                        const iconStyle = iconSizeMap[icon.size] || '';
                        const caption = variant.showCaptions ? `<div style="margin-top: 8px; font-size: 12px; color: #555;">${icon.tooltip}</div>` : '';
                        return `
                          <div style="text-align: center;" icon-position="${variant.iconPosition}">
                            <i class="${icon.class}" style="${iconStyle}" title="${icon.tooltip}"></i>
                            ${caption}
                          </div>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `,
    };
  },
};
