import {Attribute, Component, HostListener, Inject, Injector, Optional} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import {AppDefaults, noop, setListClass, switchClass} from '@wm/core';
import { convertDataToObject, IWidgetConfig, groupData, handleHeaderClick, provideAs, provideAsWidgetRef, styler, toggleAllHeaders } from '@wm/components/base';
import { DatasetAwareFormComponent } from '../dataset-aware-form.component';

import { registerProps } from '../checkboxset/checkboxset.props';
import {forEach, includes} from "lodash-es";

declare const $;

const DEFAULT_CLS = 'app-checkboxset list-group inline';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmCheckboxset]',
    exportAs: 'wmCheckboxset',
    templateUrl: 'checkboxset.component.html',
    providers: [
        provideAs(CheckboxsetComponent, NG_VALUE_ACCESSOR, true),
        provideAs(CheckboxsetComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(CheckboxsetComponent)
    ]
})

export class CheckboxsetComponent extends DatasetAwareFormComponent {
    static initializeProps = registerProps();

    public layout = '';
    public collapsible: boolean;

    protected match: string;
    protected dateformat: string;

    public disabled: boolean;
    public itemsperrow: string;
    private itemsPerRowClass: string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any, @Inject(Object) data ?: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
        this.multiple = true;
        for (let [key, value] of Object.entries(data)) {
            this[key] = value;
        }
    }

    _select(item: any, $event: any) {
        const keys = [];
        forEach(this.datasetItems, (datasetItem: any) => {
            if(datasetItem.key === item.key)
                datasetItem.selected = !datasetItem.selected;

            if(datasetItem.selected)
                keys.push(datasetItem.key);
        });
        this.modelByKey = keys;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    onCheckboxLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }

        // construct the _model from the checked elements.
        const inputElements = this.nativeElement.querySelectorAll('input:checked');
        const keys = [];
        forEach(inputElements, ($el) => {
            // @ts-ignore
            keys.push($el.value);
        });

        this.modelByKey = keys;

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
        } else if (!includes(['change'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    @HostListener('keydown.enter', ['$event', '"ENTER"'])
    onKeyDown($event) {
        $event.preventDefault();
        $event.target.click();
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }
        if (key === 'required') {
            this._onChange(this.datavalue);
            return;
        }
        if (key === 'itemsperrow') {
            setListClass(this);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
