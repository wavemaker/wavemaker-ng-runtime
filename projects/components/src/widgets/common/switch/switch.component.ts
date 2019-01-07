import { AfterViewInit, Component, Injector } from '@angular/core';

import { $appDigest, debounce, isDefined, setCSS, toBoolean } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './switch.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { DataSetItem } from '../../../utils/form-utils';

declare const _, $;

const DEFAULT_CLS = 'app-switch';
const WIDGET_CONFIG = {widgetType: 'wm-switch', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSwitch]',
    templateUrl: './switch.component.html',
    providers: [
        provideAsNgValueAccessor(SwitchComponent),
        provideAsWidgetRef(SwitchComponent)
    ]
})
export class SwitchComponent extends DatasetAwareFormComponent implements AfterViewInit {

    options = [];
    selectedItem: DataSetItem;
    iconclass;
    private btnwidth;
    private disabled: boolean;
    private _debounceSetSelectedValue: Function;

    constructor(inj: Injector, ) {
        super(inj, WIDGET_CONFIG);

        this._debounceSetSelectedValue = debounce((val) => {
            this.setSelectedValue();
            this.updateHighlighter(val);
            // only for default value trigger app digest to apply the selectedItem
            if (val) {
                $appDigest();
            }
        }, 200);

        const datasetSubscription = this.dataset$.subscribe(() => this.updateSwitchOptions());

        this.registerDestroyListener(() => datasetSubscription.unsubscribe());

        const datavalueSubscription = this.datavalue$.subscribe(() => {
            this._debounceSetSelectedValue(true);
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement as HTMLElement, this);
    }

    onStyleChange(key: string, nv: any, ov?: any) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', nv ? 'auto' : '');
        } else {
            super.onStyleChange(key, nv, ov);
        }
    }

    // This function sets the selectedItem by either using compareby fields or selected flag on datasetItems.
    private setSelectedValue() {
        if (isDefined(this.datavalue) || isDefined(this.toBeProcessedDatavalue)) {
            this.selectedItem = _.find(this.datasetItems, {selected: true});
            return;
        }

        // If no value is provided, set first value as default if options are available else set -1 ie no selection
        this.selectOptAtIndex(0);
    }

    // set the css for switch overlay element.
    // set the selected index from the datasetItems and highlight the datavalue on switch.
    private updateSwitchOptions() {
        if (this.datasetItems.length) {
            this.btnwidth = (100 / this.datasetItems.length);
            setCSS(this.nativeElement.querySelector('.app-switch-overlay') as HTMLElement, 'width', this.btnwidth + '%');
        }

        this._debounceSetSelectedValue(true);
    }

    // This function animates the highlighted span on to the selected value.
    private updateHighlighter(skipAnimation?) {
        const handler = $(this.nativeElement).find('span.app-switch-overlay');

        this.setSelectedValue();

        let left,
            index = this.selectedItem ? _.findIndex(this.datasetItems, {key: this.selectedItem.key}) : -1;

        if (index === undefined || index === null) {
            index = -1;
        }
        left = index * this.btnwidth;
        if (skipAnimation) {
            handler.css('left', left + '%');
        } else {
            handler.animate({
                left: left + '%'
            }, 300);
        }
    }

    selectOptAtIndex($index) {
        if (!this.datasetItems.length) {
            return;
        }
        const opt = this.datasetItems[$index];
        this._modelByValue = opt.value;
    }

    // Triggered on selected the option from the switch.
    // set the index and highlight the default value. Invoke onchange event handler.
    selectOpt($event, $index, option) {
        this.modelByKey = option.key;

        this.invokeOnTouched();
        $event.preventDefault();

        if (this.disabled) {
            return;
        }

        if (this.selectedItem && $index === _.findIndex(this.datasetItems, {key: this.selectedItem.key})) {
            if (this.datasetItems.length === 2) {
                $index = $index === 1 ? 0 : 1;
            } else {
                return;
            }
        }
        this.selectedItem = this.datasetItems[$index];
        this.updateHighlighter();

        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
        $appDigest();
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'disabled' && !toBoolean(nv)) {
            this.nativeElement.removeAttribute(key);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
