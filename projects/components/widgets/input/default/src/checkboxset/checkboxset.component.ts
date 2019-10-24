import { Attribute, Component, Injector, OnInit } from '@angular/core';

import { AppDefaults, noop, switchClass } from '@wm/core';
import { DatasetAwareFormComponent, convertDataToObject, IWidgetConfig, groupData, handleHeaderClick, provideAsNgValueAccessor, provideAsWidgetRef, styler, ToDatePipe, toggleAllHeaders } from '@wm/components/base';

import { registerProps } from '../checkboxset/checkboxset.props';

declare const _, $;

const DEFAULT_CLS = 'app-checkboxset list-group';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmCheckboxset]',
    exportAs: 'wmCheckboxset',
    templateUrl: 'checkboxset.component.html',
    providers: [
        provideAsNgValueAccessor(CheckboxsetComponent),
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

    constructor(
        inj: Injector,
        @Attribute('groupby') public groupby: string,
        private appDefaults: AppDefaults,
        public datePipe: ToDatePipe
    ) {
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

    private getGroupedData() {
        return this.datasetItems.length ? groupData(this, convertDataToObject(this.datasetItems), this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, 'dataObject', this.appDefaults) : [];
    }

    private datasetSubscription() {
        const datasetSubscription = this.dataset$.subscribe(() => {
            this.groupedData = this.getGroupedData();
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        } else if (key === 'groupby' || key === 'match') {
            this.datasetSubscription();
            // If groupby is set, get the groupedData from the datasetItems.
            this.groupedData = this.getGroupedData();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.groupby) {
            this.datasetSubscription();
            // If groupby is set, get the groupedData from the datasetItems.
            this.groupedData = this.getGroupedData();
        }
        // adding the handler for header click and toggle headers.
        if (this.groupby && this.collapsible) {
            this.handleHeaderClick = handleHeaderClick;
            this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
        }
    }
}
