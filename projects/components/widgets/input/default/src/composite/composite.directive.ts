import { AfterViewInit, ContentChildren, Directive, Injector } from '@angular/core';

import { addForIdAttributes, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, WidgetRef } from '@wm/components/base';

import { registerProps } from './composite.props';

declare const $;

const DEFAULT_CLS = 'form-group app-composite-widget clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-form-group',
    hostClass: DEFAULT_CLS
};

const CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top',
    floating: 'caption-float'
};

@Directive({
    selector: 'div[wmComposite]',
    providers: [
        provideAsWidgetRef(CompositeDirective)
    ]
})
export class CompositeDirective extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

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
        addForIdAttributes(this.nativeElement);

        this.assignRequiredToSubComponents();
    }
}
