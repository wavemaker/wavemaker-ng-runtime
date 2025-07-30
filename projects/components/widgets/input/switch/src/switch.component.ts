import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, Inject, Injector, Optional} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import {$appDigest, debounce, isDefined, setCSS, toBoolean} from '@wm/core';
import { DataSetItem, provideAs, provideAsWidgetRef, styler, TextContentDirective } from '@wm/components/base';
import { DatasetAwareFormComponent } from '@wm/components/input/dataset-aware-form';

import { registerProps } from './switch.props';
import {find, findIndex, forEach, isArray, isNull, isUndefined, trim} from "lodash-es";

declare const $;

const DEFAULT_CLS = 'app-switch';
const WIDGET_CONFIG = {widgetType: 'wm-switch', hostClass: DEFAULT_CLS};

@Component({
  standalone: true,
  imports: [CommonModule, TextContentDirective],
    selector: '[wmSwitch]',
    templateUrl: './switch.component.html',
    providers: [
        provideAs(SwitchComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(SwitchComponent)
    ],
    exportAs: 'wmSwitch'
})
export class SwitchComponent extends DatasetAwareFormComponent implements AfterViewInit {
    static initializeProps = registerProps();

    options = [];
    selectedItem: DataSetItem;
    iconclass;
    checkediconclass;
    multiple: boolean;
    private btnwidth;
    public disabled: boolean;
    public required: boolean;
    private _debounceSetSelectedValue: Function;
    public name: string;
    public hint:any;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.multiple = this.getAttr("multiple") === "true";
        this.checkediconclass = this.getAttr("checkediconclass");

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
            this.selectedItem = find(this.datasetItems, {selected: true});
            return;
        }

        // If no value is provided, set first value as default if options are available else set -1 ie no selection
        this.selectOptAtIndex(0);
    }

    // set the css for switch overlay element.
    // set the selected index from the datasetItems and highlight the datavalue on switch.
    private updateSwitchOptions() {
        if (this.datasetItems.length && !this.multiple) {
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
            index = this.selectedItem ? findIndex(this.datasetItems, {key: this.selectedItem.key}) : -1;

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
        $event.preventDefault();

        if (this.disabled) {
            return;
        }

        if(this.multiple) {
            const keys = [];
            this.datasetItems[$index].selected = !this.datasetItems[$index].selected;
            forEach(this.datasetItems, (item: any) => {
                if(item.selected)
                    keys.push(item.key);
            });
            this.modelByKey = keys;
            this.selectedItem = find(this.datasetItems, {selected: true});
        }
        else {
            this.modelByKey = option.key;
            if (!this.multiple && this.selectedItem && $index === findIndex(this.datasetItems, {key: this.selectedItem.key})) {
                if (this.datasetItems.length === 2) {
                    $index = $index === 1 ? 0 : 1;
                } else {
                    return;
                }
            }
            this.selectedItem = this.datasetItems[$index];
            this.updateHighlighter();
        }

        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
        $appDigest();
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'disabled' && !toBoolean(nv)) {
            this.nativeElement.removeAttribute(key);
        } else {
            if(key==='hint')
            {
                if (isUndefined(nv) || isNull(nv) || trim(nv) === '') {
                    this.hint=[];
                }
                else  if (!isArray(nv)) {
                    this.hint= [nv];
                }
            }
            super.onPropertyChange(key, nv, ov);
        }
    }
}
