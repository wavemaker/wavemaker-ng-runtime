import { AfterViewInit, Component, ElementRef, Injector, ViewChild} from '@angular/core';

import { $appDigest, setCSS } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './switch.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { DataSetItem, setItemByCompare } from '../../../utils/form-utils';

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
    private oldVal;
    private btnwidth;
    private compareby;

    @ViewChild('switch', {read: ElementRef}) switchEl: ElementRef;

    constructor(inj: Injector, ) {
        super(inj, WIDGET_CONFIG);

        this.dataset$.subscribe(() => {
            this.updateSwitchOptions();
        });

        this.datavalue$.subscribe(() => {
            this.setSelectedValue();
            this.updateHighlighter(true);
        });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.switchEl.nativeElement as HTMLElement, this);
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', newVal ? 'auto' : '');
        }
    }

    // This function sets the selectedItem by either using compareby fields or selected flag on datasetItems.
    private setSelectedValue() {
        if (this.datafield === 'All Fields' && this.compareby && this.compareby.length) {
            setItemByCompare(this.datasetItems, this.datavalue, this.compareby);
        }
        const selectedItem =  _.find(this.datasetItems, {'selected' : true});

        if (selectedItem) {
            this.selectedItem = selectedItem;
            return;
        }
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
            index = this.selectedItem ? this.selectedItem.index - 1 : -1;

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
        this.modelByKey = option.key;

        this.invokeOnTouched();
        $event.preventDefault();

        if ($index === (this.selectedItem.index - 1)) {
            if (this.datasetItems.length === 2) {
                $index = $index === 1 ? 0 : 1;
            } else {
                return;
            }
        }
        this.selectedItem = this.datasetItems[$index];
        this.updateHighlighter();

        this.invokeEventCallback('change', {$event, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;

        $appDigest();
    }

    reset() {
        if (this.datasetItems.length > 0) {
            this.datavalue = this.datasetItems[0].value;
            this.selectedItem = this.datasetItems[0];
        }
    }
}
