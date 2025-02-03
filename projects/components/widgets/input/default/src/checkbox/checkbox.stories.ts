import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Form/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    class : {
      control: 'select',
      options: ['primary','secondary','tertiary','success','info','warning','error'],
    }
  },
 
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

const getUpdatedCssVars = (selectedClass: string) => {
  if (!selectedClass) return {};

  const className = selectedClass.split(" ").pop();
  const rootStyle = getComputedStyle(document.documentElement);

  if (className === 'primary') {
    const primaryColor = rootStyle.getPropertyValue(`--wm-color-${className}`).trim() || "";

    return {
      '--wm-checkbox-background-selected': primaryColor,
      '--wm-checkbox-border-color-selected': primaryColor,
      '--wm-checkbox-icon-color-selected': primaryColor,
      // '--wm-checkbox-selected-state-hover': primaryColor,
      // '--wm-checkbox-selected-state-focus': primaryColor,
    };
  } else {
    const colorValue = rootStyle.getPropertyValue(`--wm-color-${className}`).trim() || "";

    return {
      [`--wm-color-${className}`]: colorValue,
      [`--wm-color-on-${className}`]: colorValue,
    };
  }
};

const updateCssVarsObject = (optionsArray: Array<any>) => {
  let defaultOptions = ['primary','secondary','tertiary','success','info','warning','error'];
  let finalCssVariable = {};
  optionsArray.forEach((element, index) => {
      let cssVariableKey = defaultOptions[index];
      finalCssVariable[cssVariableKey] = getUpdatedCssVars(element);
  });
  return finalCssVariable;
};


export const Default: Story = {
  args: {
    _caption: "checkbox",
    class: 'secondary',
    disabled: false,
    readonly : false,
    required : false

  },
  // Exclude `class` from the Default story
  parameters: {
    controls: {
      exclude: ['class'],
    },
  },
};

export const Class: Story = {
  args: {
    _caption: "checkbox",
    class: 'success',
    datavalue : true,
    disabled: false,
  },
  parameters: {
    cssVars: updateCssVarsObject(['primary','secondary','tertiary','success','info','warning','error']), 
  },
};

export const AllVariants: Story = {
  parameters: {
    actions: { disable: true },
    controls: { disable: true },
    backgrounds: { disable: true },
    interactions: { disable: true },
    'storybook/visual-tests': { disable: true },
    'storybook/css-tokens/panel': { disable: true },
  },
  render: () => {
    const variants = [
      {
        heading: 'Primary',
        checkboxes: [
          { _caption: 'Primary Checkbox', datavalue: true, disabled: false, class: 'primary', readonly: false },
          { _caption: 'Success Checkbox', datavalue: true, disabled: false, class: 'success', readonly: false },
          { _caption: 'Error Checkbox', datavalue: true, disabled: false, class: 'error', readonly: true },
        ],
      },
      {
        heading: 'Disabled/Readonly',
        checkboxes: [
          { _caption: 'Disabled Primary', datavalue: false, disabled: true, class: 'primary', readonly: true },
        ],
      },
    ];

    return {
      template: `
        ${variants
          .map(
            (variant) => `
            <div  style="margin:0 16px;">
              <h6 style="margin:24px 0;">${variant.heading}</h6>
              <div style="display: flex; gap: 16px; align-items: center;">
                ${variant.checkboxes
                  .map(
                    (checkbox) => `
                    <div wmcheckbox="" widget-id="widget-id173" class="app-checkbox checkbox ${checkbox.class}">
                      <label [ngClass]="{'unchecked': !checkbox.datavalue}">
                        <input type="checkbox" 
                               [(ngModel)]="checkbox.datavalue"
                              
                               [readonly]="checkbox.readonly"
                               [tabindex]="0"
                               class="ng-untouched ng-pristine ng-valid" 
                                ${checkbox.disabled ? 'disabled' : ''} />
                        <span class="caption">${checkbox._caption}</span>
                        <img alt="Checkbox Image" aria-hidden="true" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" class="switch">
                      </label>
                      <input type="hidden" aria-hidden="true" tabindex="-1" class="ng-hide model-holder" value="${checkbox.datavalue}">
                    </div>
                  `
                  )
                  .join('')}
              </div>
            </div>
          `
          )
          .join('')}
      `,
    };
  },
};
