import { Component, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { switchClass } from '@wm/core';

import { provideAsWidgetRef, styler, provideAs } from '@wm/components/base';
import { DatasetAwareFormComponent } from '../dataset-aware-form.component';
import { registerProps } from './radioset.props';

declare const $, _;

const DEFAULT_CLS = 'app-radioset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-radioset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmRadioset]',
    exportAs: 'wmRadioset',
    templateUrl: './radioset.component.html',
    providers: [
        provideAs(RadiosetComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(RadiosetComponent)
    ]
})
export class RadiosetComponent extends DatasetAwareFormComponent {
    static initializeProps = registerProps();

    public layout = '';
    public disabled: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = false;
    }

    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }

        this.modelByKey = key;

        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName === 'click') {
            this.eventManager.addEventListener(
                node,
                eventName,
                e => {
                    if (!$(e.target).is('input')) {
                        return;
                    }
                    locals.$event = e;
                    return callback();
                }
            );
        } else if (!_.includes(['change'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'tabindex') {
            return;
        }

        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
