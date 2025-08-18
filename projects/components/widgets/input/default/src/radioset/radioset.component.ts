import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {Component, Inject, Injector, Optional} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import {setListClass} from '@wm/core';

import { provideAsWidgetRef, styler, provideAs } from '@wm/components/base';
import { DatasetAwareFormComponent } from '../dataset-aware-form.component';
import { registerProps } from './radioset.props';
import { includes} from "lodash-es";

declare const $;

const DEFAULT_CLS = 'app-radioset list-group inline';
const WIDGET_CONFIG = {widgetType: 'wm-radioset', hostClass: DEFAULT_CLS};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
    selector: '[wmRadioset]',
    exportAs: 'wmRadioset',
    templateUrl: './radioset.component.html',
    providers: [
        provideAs(RadiosetComponent, NG_VALUE_ACCESSOR, true),
        provideAs(RadiosetComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(RadiosetComponent)
    ]
})
export class RadiosetComponent extends DatasetAwareFormComponent {
    static initializeProps = registerProps();

    public layout = '';
    public disabled: boolean;
    public itemsperrow: string;
    private itemsPerRowClass: string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
        this.multiple = false;
    }

    triggerInvokeOnChange(key, $event) {
        this.modelByKey = key;

        if(this.viewParent.containerWidget && this.viewParent.containerWidget.updateDataValue)
            this.viewParent.containerWidget.updateDataValue(this.datavalue);

        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }

        this.triggerInvokeOnChange(key, $event);
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
        } else if (!includes(['change'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'itemsperrow') {
            setListClass(this);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
