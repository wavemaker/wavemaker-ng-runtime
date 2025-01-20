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


const iconList = [
  'add', 'archive', 'arrow-back', 'arrow-drop-down', 'arrow-drop-up', 'arrow-forward',
  'arrow-left', 'arrow-right', 'attach-file', 'bookmark-filled', 'bookmark',
  'cancel', 'chat-bubble-filled', 'chat-bubble', 'check-box-checked',
  'check-box-outline-blank', 'check-box-unchecked', 'check-indeterminate-small',
  'check-small', 'check', 'close', 'commute', 'content-cut', 'dark-mode', 'delete',
  'directions-bus', 'directions-car', 'directions-subway', 'directions-walk',
  'download', 'edit', 'error', 'fast-forward', 'fast-rewind', 'favorite',
  'folder-filled', 'folder', 'forward', 'g-translate', 'gif', 'gmail-groups',
  'inbox-filled', 'inbox', 'indeterminate-check-box-checked',
  'indeterminate-check-box-unchecked', 'keyboard-return', 'keyboard', 'language',
  'light-mode', 'local-taxi', 'location-on-filled', 'location-on', 'mail-filled',
  'mail', 'menu', 'mic', 'mobile-friendly', 'mood', 'more-horiz', 'more-vert',
  'music-note', 'navigate-before', 'navigate-next', 'notifications', 'outbox',
  'person', 'photo', 'play-arrow', 'radio-button-checked',
  'radio-button-unchecked', 'schedule', 'search', 'send', 'settings-filled',
  'settings', 'share', 'skip-next', 'skip-previous', 'star-filled', 'star',
  'stars-filled', 'stars', 'sticker', 'text-fields', 'today', 'upload', 'videocam'
];

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

export const AllIcons: Story = {
  args: {
    iconsize: 'Base',
    iconclass: '',
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
    
    const iconElements = iconList.map(icon => {
      const iconClass = `mi mi-${icon} ${selectedIconSize}`.trim();
      return `
        <div class="icon-item">
          <i class="${iconClass}"></i>
          <div class="icon-caption">${icon}</div>
        </div>
      `;
    }).join('');

    return {
      template: `
        <div class="icon-grid">
          ${iconElements}
        </div>
      `,
      styles: [`
        .icon-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          padding: 20px;
        }
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 10%;
          max-width: 80px; /* Ensure icons don't get too large */
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
    controls: { disable: true },
    actions: { disable: true },
    backgrounds: { disable: true },
    interactions: { disable: true },
    // previewTabs: {
    //   'storybook/visual': { hidden: true },
    //   'storybook/interactions': { hidden: true },
    // },
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
