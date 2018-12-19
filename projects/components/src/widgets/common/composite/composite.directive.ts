import { AfterViewInit, ContentChildren, Directive, Injector } from '@angular/core';

import { setAttr, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './composite.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

declare const $;

const DEFAULT_CLS = 'form-group app-composite-widget clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-form-group',
    hostClass: DEFAULT_CLS
};

registerProps();

const CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top'
};

@Directive({
    selector: 'div[wmComposite]',
    providers: [
        provideAsWidgetRef(CompositeDirective)
    ]
})
export class CompositeDirective extends StylableComponent implements AfterViewInit {

    // this is the reference to the component refs inside the form-group
    @ContentChildren(WidgetRef, {descendants: true}) componentRefs;

    public required: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    /**
     * this is onPropertyChange handler for the form-group component
     * @param key
     * @param nv
     * @param ov
     */
    onPropertyChange(key, nv, ov) {
        if (key === 'captionposition') {
            switchClass(this.nativeElement, CAPTION_POSITION[nv], CAPTION_POSITION[ov]);
        } else if (key === 'required') {
            this.required = nv;
            this.assignRequiredToSubComponents();
        } else {
            super.onPropertyChange(key, nv, ov);
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

    ngAfterViewInit() {
        super.ngAfterViewInit();
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
