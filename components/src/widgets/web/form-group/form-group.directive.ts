import { AfterViewInit, ContentChildren, Directive, Injector } from '@angular/core';

import { setAttr, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './form-group.props';

declare const $;

const HOST_CLS = 'form-group app-form-group-widget clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-form-group', hostClass: HOST_CLS};

registerProps();

const CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top'
};

@Directive({
    selector: 'div[wmFormGroup]'
})
export class FormGroupDirective extends StylableComponent implements AfterViewInit {

    // this is the reference to the component refs inside the form-group
    @ContentChildren('@Widget', {descendants: true}) componentRefs;

    public required: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    /**
     * this is onPropertyChange handler for the form-group component
     * @param key
     * @param newVal
     * @param oldVal
     */
    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'captionposition':
                switchClass(this.$element, CAPTION_POSITION[newVal], CAPTION_POSITION[oldVal]);
                break;
            case 'required':
                this.required = newVal;
                this.assignRequiredToSubComponents();
                break;
        }
    }

    /**
     * this method assigns the required on the component/directive based on the required attribute of the form-group
     */
    protected assignRequiredToSubComponents() {
        if (this.required && this.componentRefs) {
            setTimeout(() => {
                this.componentRefs.forEach(componentRef => componentRef.widget.required = true);
            }, 50);
        }
    }

    /**
     * this method is invoked after the view init - invoked by angular as per life cycle
     */
    ngAfterViewInit() {
        const labelEl = this.nativeElement.querySelectorAll('label.control-label'),
            inputEl = this.nativeElement.querySelectorAll('input, select, textarea');
        /*if there are only one input el and label El add id and for attribute*/
        if (labelEl.length === 1 && inputEl.length === 1) {
            const widgetId = $(inputEl[0] as HTMLElement).closest('[widget-id]').attr('widget-id');
            if (widgetId) {
                setAttr(inputEl[0] as HTMLElement, 'id', widgetId);
                setAttr(labelEl[0] as HTMLElement, 'for', widgetId);
            }
        }

        this.assignRequiredToSubComponents();
    }
}