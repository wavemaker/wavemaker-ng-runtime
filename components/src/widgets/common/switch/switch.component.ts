import { Component, Injector, OnInit } from '@angular/core';

import { setCSS } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './switch.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

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
export class SwitchComponent extends DatasetAwareFormComponent implements OnInit {

    options = [];
    selected: any = {};
    iconclass;
    private oldVal;
    private btnwidth;

    constructor(inj: Injector, ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        this.listenToDataset.subscribe(() => {
            this.updateSwitchOptions();
        });

        this.listenToDatavalue.subscribe(() => {
            this.setSelectedValue();
            this.updateHighlighter(true);
        });
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.children[0] as HTMLElement, this);
    }

    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', newVal ? 'auto' : '');
        }
    }

    // This function sets the selected index.
    private setSelectedValue() {
        const selectedItem =  _.find(this.datasetItems, {'selected' : true});

        if (selectedItem) {
            this.selected.index = selectedItem.index - 1;
            return;
        }
        // Todo: compare the fields based on compareby property.
    }

    // set the css for switch overlay element.
    // set the selected index from the datasetItems and highlight the datavalue on switch.
    private updateSwitchOptions() {
        if (this.datasetItems.length) {
            this.btnwidth = (100 / this.datasetItems.length);
            setCSS(this.nativeElement.querySelector('.app-switch-overlay') as HTMLElement, 'width', this.btnwidth + '%');
        }

        this.setSelectedValue();
        this.updateHighlighter(true);
    }

    // This function animates the highlighted span on to the selected value.
    private updateHighlighter(skipAnimation?) {
        const handler = $(this.nativeElement).find('span.app-switch-overlay');

        this.setSelectedValue();

        let left,
            index = this.selected.index;

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

    // Triggered on selected the option from the switch.
    // set the index and highlight the default value. Invoke onchange event handler.
    selectOpt($event, $index, option) {
        this.proxyModel = option.key;

        this.invokeOnTouched();
        $event.preventDefault();

        if (this.selected.index === $index) {
            if (this.datasetItems.length === 2) {
                $index = $index === 1 ? 0 : 1;
            } else {
                return;
            }
        }
        this.selected.index = $index;
        this.updateHighlighter();

        this.invokeEventCallback('change', {$event, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
    }

    reset() {
        if (this.datasetItems.length > 0) {
            this.datavalue = this.datasetItems[0].value;
            this.selected.index = 0;
        }
    }
}
