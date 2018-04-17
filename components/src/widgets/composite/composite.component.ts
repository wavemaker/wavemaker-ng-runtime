import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, Injector } from '@angular/core';

import { addClass, removeClass } from '@wm/utils';

import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './composite.props';

const HOST_CLS = 'form-group app-composite-widget clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-composite', hostClass: HOST_CLS};

registerProps();

const CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top'
};

@Component({
    selector: 'div[wmComposite]',
    template: '<ng-content></ng-content>'
})
export class CompositeComponent extends BaseComponent implements AfterViewInit {

    // this is the reference to the component refs inside the composite
    @ContentChildren('@Widget', {descendants: true}) componentRefs;

    required: boolean;

    /**
     * this is onPropertyChange handler for the composite component
     * @param key
     * @param newVal
     * @param oldVal
     */
    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'captionposition':
                removeClass(this.$element, CAPTION_POSITION[oldVal]);
                addClass(this.$element, CAPTION_POSITION[newVal]);
                break;
            case 'required':
                this.required = newVal;
                this.assignRequiredToSubComponents();
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    /**
     * this method assigns the required on the component/directive based on the required attribute of the composite
     */
    private assignRequiredToSubComponents() {
        if (this.required) {
            this.componentRefs && this.componentRefs.forEach(componentRef => {
                // Do not apply required on container
                if (componentRef.widgetType === 'wm-container') {return;}
                setTimeout(() => componentRef.widget.required = true, 100)
            });
        }
    }

    /**
     * this method is invoked after the view init - invoked by angular as per life cycle
     */
    ngAfterViewInit() {
        const labelEl = this.$element.querySelectorAll('label'),
            inputEl = this.$element.querySelectorAll('input, select, textarea');
        /*if there are only one input el and label El add id and for attribute*/
        if (labelEl.length && inputEl.length) {
            let inputName = inputEl[0].getAttribute('name') || inputEl[0].parentElement.getAttribute('name');
            inputEl[0].setAttribute('id', inputName);
            labelEl[0].setAttribute('for', inputName);
        }

        this.assignRequiredToSubComponents();
    }
}