import { Injector } from '@angular/core';

import { DataSource } from '@wm/core';

import { IWidgetConfig, StylableComponent } from '@wm/components/base';

declare const _;

export abstract class BaseFormComponent extends StylableComponent {
    public datavalue;
    private prevDatavalue;
    protected binddatavalue: string;
    private datavaluesource: any;

    protected constructor(
        protected inj: Injector,
        config: IWidgetConfig,
        initPromise?: Promise<any>
    ) {
        super(inj, config, initPromise);
        this.binddatavalue = this.$element.attr('datavalue.bind');
    }

    /**
     * Responsible for updating the variable bound to the widget's datavalue property.
     * @param value
     */
    updateBoundVariable(value) {
        let binddatavalue = this.binddatavalue;

        // return if the variable bound is not static.
        if (this.datavaluesource && this.datavaluesource.execute(DataSource.Operation.IS_API_AWARE)) {
            return;
        } else if (this.datavaluesource && !this.datavaluesource.twoWayBinding) {
                return;
        }

        // return if widget is bound.
        if (!binddatavalue || binddatavalue.startsWith('Widgets.') || binddatavalue.startsWith('itemRef.currentItemWidgets')) {
            return;
        }

        binddatavalue = binddatavalue.replace(/\[\$i\]/g, '[0]');

        // In case of list widget context will be the listItem.
        if (_.has(this.context, binddatavalue.split('.')[0])) {
            _.set(this.context, binddatavalue, value);
        } else {
            _.set(this.viewParent, binddatavalue, value);
        }
    }

    protected invokeOnChange(value, $event?: Event) {
        // invoke the event callback
        if ($event) {
            if (this.datavalue !== this.prevDatavalue) {
                this.updateBoundVariable(value);
                this.invokeEventCallback('change', {
                    $event,
                    newVal: value,
                    oldVal: this.prevDatavalue
                });
            }
        }
        // update the previous value
        this.prevDatavalue = value;
    }

    protected updatePrevDatavalue(val: any) {
        this.prevDatavalue = val;
    }
}
