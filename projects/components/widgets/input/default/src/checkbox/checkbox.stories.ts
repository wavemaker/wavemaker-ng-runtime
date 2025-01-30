import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Form/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    class : {
      control: 'select',
      options: ['primary','secondary', 'success', 'error'],
    }
  }
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

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
    datavalue : true,
    disabled: true,
    class: 'success',
  },
};

export const AllVariants1: Story = {
  render: () => {
    const variants = [
      {
        heading: 'Primary',
        checkboxes: [
          { _caption: 'Primary Checkbox', datavalue: true, disabled: false, class: 'primary',readonly:false },
          { _caption: 'Secondary Checkbox', datavalue: true, disabled: false, class: 'secondary' ,readonly:false},
          { _caption: 'Success Checkbox', datavalue: true, disabled: false, class: 'success',readonly:false },
          { _caption: 'Error Checkbox', datavalue: true, disabled: false, class: 'error',readonly:true },
        ],
      },
      {
        heading: 'Disabled/Readonly',
        checkboxes: [
          { _caption: 'Disabled Primary', datavalue: false, disabled: true, class: 'primary',readonly:true },
          { _caption: 'Readonly Secondary', datavalue: true, readonly: true, class: 'secondary' },
        ],
      },
     
    ];
  
    return {
      template: `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          ${variants
            .map(
              (variant) => `
              <div>
                <h6>${variant.heading}</h6>
                <div style="display: flex; gap: 16px; align-items: center;">
                  ${variant.checkboxes
                    .map(
                      (checkbox) => 
                       `
                      <label style="display: flex; align-items: center; gap: 8px;">
                        <input
                          type="checkbox"
                          ${checkbox.datavalue ? 'checked' : ''}
                          ${checkbox.disabled ? 'disabled' : ''}
                          ${checkbox.readonly ? 'readonly' : ''}
                          ${checkbox.class ? 'error' : 'warning'}
                        />
                        <span class="${checkbox.class}">${checkbox._caption}</span>
                      </label>
                    `
                    )
                    .join('')}
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      `,
    };
  },
};



export const AllVariants: Story = {
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
            <div>
              <h6>${variant.heading}</h6>
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
