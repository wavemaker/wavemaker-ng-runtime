import { Attribute, Component, Injector, OnInit} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { AppDefaults, noop, setListClass, switchClass} from '@wm/core';
import { convertDataToObject, IWidgetConfig, groupData, handleHeaderClick, provideAs, provideAsWidgetRef, styler, ToDatePipe, toggleAllHeaders } from '@wm/components/base';
import { DatasetAwareFormComponent } from '../dataset-aware-form.component';

import { registerProps } from '../checkboxset/checkboxset.props';

declare const _, $;

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

export class CheckboxsetComponent extends DatasetAwareFormComponent implements OnInit {
    static initializeProps = registerProps();

    public layout = '';
    public collapsible: boolean;

    protected match: string;
    protected dateformat: string;
    protected groupedData: any[];

    public handleHeaderClick: ($event) => void;
    private toggleAllHeaders: void;

    public disabled: boolean;
    public itemsperrow: string;
    private itemsPerRowClass: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = true;
        this.handleHeaderClick = noop;
    }

    onCheckboxLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }

        // construct the _model from the checked elements.
        const inputElements = this.nativeElement.querySelectorAll('input:checked');
        const keys = [];
        _.forEach(inputElements, ($el) => {
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
        } else if (!_.includes(['change'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
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
        } else if (key === 'groupby' || key === 'match') {
             this.setGroupData();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.groupby) {
          this.setGroupData();
        }
        // adding the handler for header click and toggle headers.
        if (this.groupby && this.collapsible) {
            this.handleHeaderClick = handleHeaderClick;
            this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
        }
    }
}
