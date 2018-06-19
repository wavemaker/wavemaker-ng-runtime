import { Attribute, Component, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from '../checkboxset/checkboxset.props';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { convertDataToObject, groupData, handleHeaderClick, toggleAllHeaders } from '../../../utils/form-utils';


registerProps();
const DEFAULT_CLS = 'app-checkboxset list-group';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS};
declare const _;

@Component({
    selector: '[wmCheckboxset]',
    exportAs: 'wmCheckboxset',
    templateUrl: 'checkboxset.component.html',
    providers: [
        provideAsNgValueAccessor(CheckboxsetComponent),
        provideAsWidgetRef(CheckboxsetComponent)
    ]
})

export class CheckboxsetComponent extends DatasetAwareFormComponent {
    public layout = '';

    protected match: string;
    protected dateformat: string;
    protected groupedData: any[];

    public handleHeaderClick: ($event) => void;
    private toggleAllHeaders: void;

    constructor(inj: Injector, @Attribute('groupby') protected groupby: string, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = true;

        // If groupby is set, get the groupedData from the datasetItems.
        if (this.groupby) {
            this.dataset$.subscribe(() => {
                this.groupedData = groupData(this, convertDataToObject(this.datasetItems), this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, 'dataObject');
            });
            // adding the handler for header click and toggle headers.
            this.handleHeaderClick = handleHeaderClick;
            this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
        }
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
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue});
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'selectedvalues') {
            this.datavalue = nv;
        } else if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        } else if (key === 'groupby' || key === 'match') {
            this.groupedData = this.datasetItems.length ? groupData(this, convertDataToObject(this.datasetItems), this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, 'dataObject') : [];
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
