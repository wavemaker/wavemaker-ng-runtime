import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { ButtonComponent } from './button.component';
import { trim } from 'jquery';

const meta: Meta<ButtonComponent> = {
  title: 'Form/Button',
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


const getUpdatedCssVars = (selectedClass: string) => {
  //debugger
  if (!selectedClass) return {};
  const className = selectedClass.split(" ").pop(); 
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    [`--wm-${className}-color`]: rootStyle.getPropertyValue(`--wm-${className}-color`).trim() || "",
    [`--wm-${className}-background`]: rootStyle.getPropertyValue(`--wm-${className}-background`).trim() || "",
    [`--wm-${className}-border-color`]: rootStyle.getPropertyValue(`--wm-${className}-border-color`).trim() || "",
    [`--wm-${className}-state-layer-color`]: rootStyle.getPropertyValue(`--wm-${className}-state-layer-color`).trim() || "",
  };

};

// const updateCssVars = (selectedClass: string) => {
//   const updatedCssVars = getUpdatedCssVars(selectedClass);
//   return updatedCssVars;
// };

const updateCssVarsObject = (optionsArray: Array<any>) => {
  let defaultOptions = ['btn-default', 'btn-primary', 'btn-secondary','btn-tertiary','btn-success','btn-info','btn-warning','btn-danger']
  let finalCssVariable = {};
  optionsArray.forEach((element, index) => {
      let cssVariableKey = defaultOptions[index];
      finalCssVariable[cssVariableKey] = getUpdatedCssVars(element);
  });
  return finalCssVariable;
};

export const Filled: Story = {
  args: {
    caption: 'Filled',
    class: 'btn-default',
    type: 'medium',
  },
  parameters: {
    cssVars: updateCssVarsObject(['btn-default', 'btn-primary', 'btn-secondary','btn-tertiary','btn-success','btn-info','btn-warning','btn-danger']),  
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
    //const updatedCssVars = updateCssVars(args.class);
  


    let finalObj = {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
      // parameters: {
      //   cssVars: updatedCssVars,
      // },
    };
    return finalObj;
  },
};


export const Outlined: Story = {
  args: {
    caption: 'Outlined',
    class: 'btn-default',
    type:'medium',
    iconposition: 'right',
    iconclass: 'wi wi-plus',
    badgevalue: ''

  },
  parameters: {
    cssVars: updateCssVarsObject(['btn-default-outlined', 'btn-primary-outlined', 'btn-secondary-outlined','btn-tertiary-outlined','btn-success-outlined','btn-info-outlined','btn-warning-outlined','btn-danger-outlined']),  
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
    //const updatedCssVars = updateCssVars(args.class);
  

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
    class: 'btn-default',
    type:'medium',
    iconposition: 'left',
    iconclass: 'wi wi-plus',
    badgevalue: ''
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
    //const updatedCssVars = updateCssVars(args.class);
  

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
    class: 'btn-default',
    type:'medium',
    iconposition: 'left',
    iconclass: 'wi wi-plus',
    badgevalue: ''
  },
  parameters: {
    cssVars: updateCssVarsObject(['btn-default', 'btn-primary', 'btn-secondary','btn-tertiary','btn-success','btn-info','btn-warning','btn-danger']),  
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
    //const updatedCssVars = updateCssVars(args.class);
  

    return {
      component: ButtonComponent,
      props: {
        ...args,
        class: updatedClass,
      },
    };
  },
};

export const AllVariants: Story = {
  args: {
    class: 'btn-default',
  },
  argTypes: {
    iconposition: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    backgrounds: { disable: true },
    interactions: { disable: true },
    'storybook/css-tokens/panel': {disable: true}
  },
  
  render: (args) => {
    //const updatedCssVars = updateCssVars(args.class);
    const variants = [   
      {
        heading: 'Filled Buttons',
        buttons: [
          {
            caption: 'Primary',
            class: 'btn-primary btn-primary',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Success',
            class: 'btn-primary btn-success',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-primary btn-warning',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-primary btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-primary btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Primary',
            class: 'btn-primary btn-primary',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Secondary',
            class: 'btn-primary btn-secondary',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-primary btn-warning',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-primary btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-primary btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
        ],
        layout: 'grid', // Indicates row layout for this section
      },
     
      {
        heading: 'Outline Buttons',
        buttons: [
          // {
          //   caption: 'Outlined',
          //   class: 'btn-outlined btn-default',
          //   type: 'medium',
          //   iconposition: 'right',
          //   iconclass: 'wi wi-plus',
          //   badgevalue: '',
          // },
          {
            caption: 'Primary',
            class: 'btn-outlined btn-default btn-primary',
            type: 'medium',
            iconposition: 'right',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Success',
            class: 'btn-outlined btn-default btn-success',
            type: 'medium',
            iconposition: 'right',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-outlined btn-default btn-warning',
            type: 'medium',
            iconposition: 'right',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-outlined btn-default btn-danger',
            type: 'medium',
            iconposition: 'right',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-outlined btn-default btn-neutral',
            type: 'medium',
            iconposition: 'right',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Primary',
            class: 'btn-outlined btn-default btn-primary',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Secondary',
            class: 'btn-outlined btn-default btn-secondary',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-outlined btn-default btn-warning',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-outlined btn-default btn-danger',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-outlined btn-default btn-neutral',
            type: 'medium',
            iconposition: '',
            iconclass: '',
            badgevalue: '',
          },
        ],
        layout: 'grid',
      },
      {
        heading: 'Text Buttons',
        buttons: [
          {
            caption: 'Primary',
            class: 'btn-text btn-primary',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Success',
            class: 'btn-text btn-success',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-text btn-warning',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-text btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-text btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Primary',
            class: 'btn-text btn-primary',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Success',
            class: 'btn-text btn-success',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-text btn-warning',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-text btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-text btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
        ],
        layout:'grid'
      },
      {
        heading: 'Elevated',
        buttons: [
          
          {
            caption: 'Primary',
            class: 'btn-elevated  btn-primary',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Secondary',
            class: 'btn-elevated  btn-secondary',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-elevated  btn-warning',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-elevated  btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-elevated  btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: 'wi wi-plus',
            badgevalue: '',
          },
          {
            caption: 'Primary',
            class: 'btn-elevated  btn-primary',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Secondary',
            class: 'btn-elevated  btn-secondary',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Warning',
            class: 'btn-elevated  btn-warning',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Danger',
            class: 'btn-elevated  btn-danger',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
          {
            caption: 'Neutral',
            class: 'btn-elevated  btn-neutral',
            type: 'medium',
            iconposition: 'left',
            iconclass: '',
            badgevalue: '',
          },
        ],
        layout:"grid"
      },
   
    
    ];

    const buttonSizeMap: Record<string, string> = {
      small: 'btn-xs',
      medium: 'btn-sm',
      large: 'btn-lg',
    };

    const sizeStyles: Record<string, string> = {
      small: 'padding: 4px 8px; font-size: 12px; width: 100px;',
      medium: 'padding: 6px 12px; font-size: 14px; width: 120px;',
      large: 'padding: 8px 16px; font-size: 16px; width: 140px;',
    };

    return {
      template: `
        <div style="display: flex; flex-direction: column; gap: 24px; margin: 0 12px;">
          ${variants
            .map((variant) => {
              const isGridLayout = variant.layout === 'grid';
              return `
                <div>
                  <h6 style="margin:16px 0;">${variant.heading}</h6>
                  <div style="
                  display: ${isGridLayout ? 'grid' : 'flex'};
                    ${isGridLayout ? 'grid-template-columns: repeat(5, 1fr); column-gap: 15px; row-gap: 15px;' : 'gap: 8px;'}
                  ">
                    ${variant.buttons
                      .map((button) => {
                        const buttonSizeStyle = sizeStyles[button.type] || '';
                        const updatedClass = `${button.class}`.trim();

                        return `
                          <button class="${updatedClass}" style="position: relative; ${buttonSizeStyle}">
                            ${
                              button.iconposition === 'left'
                                ? `<i class="${button.iconclass}" style="margin-right: 4px;"></i>`
                                : ''
                            }
                            ${button.caption}
                            ${
                              button.iconposition === 'right'
                                ? `<i class="${button.iconclass}" style="margin-left: 4px;"></i>`
                                : ''
                            }
                            ${
                              button.badgevalue
                                ? `<span style="position: absolute; top: -5px; right: -10px; background-color: red; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px;">
                                    ${button.badgevalue}
                                  </span>`
                                : ''
                            }
                          </button>
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
