import { ChangeDetectorRef, Component, Injector, ViewChild, Inject } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap';

import { EVENT_LIFE, addEventListenerOnElement, getDateObj, getFormattedDate, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './date.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

registerProps();

const DEFAULT_CLS = 'app-date input-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-date',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmDate]',
    templateUrl: './date.component.html',
    providers: [
        provideAsNgValueAccessor(DateComponent),
        provideAsWidgetRef(DateComponent)
    ]
})
export class DateComponent extends BaseDateTimeComponent {
    private bsDataValue;
    public showdropdownon: string;
    public useDatapicker = true;
    private dateContainerCls: string;
    private isOpen: boolean;

    private keyEventPlugin;
    private deregisterEventListener;

    get timestamp() {
        return this.bsDataValue ? this.bsDataValue.valueOf() : undefined;
    }

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this._dateOptions.dateInputFormat) || '';
    }

    get datavalue () {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputformat) || '';
    }

    // Todo[Shubham]: needs to be redefined
    // sets the dataValue and computes the display model values
    set datavalue(newVal) {
        if (newVal) {
            this.bsDataValue = getDateObj(newVal);
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue);
        this.cdRef.detectChanges();
    }

    @ViewChild(BsDatepickerDirective) protected bsDatePickerDirective;

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(inj: Injector, public datePipe: ToDatePipe, private cdRef: ChangeDetectorRef,
                @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1].constructor;
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `theme-red ${this.dateContainerCls}`;
        this._dateOptions.showWeekNumbers = false;
    }

    /**
     * This is an internal method triggered when the date input changes
     */
    onDisplayDateChange($event) {
        const newVal = getDateObj($event.target.value);
        this.setDataValue(newVal);
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue, {}, true);
    }

    onDatePickerOpen() {
        this.invokeOnTouched();
        this.isOpen = true;
        const dateContainer  = document.querySelector(`.${this.dateContainerCls}`) as HTMLElement;
        setAttr(dateContainer, 'tabindex', '0');
        this.addDatepickerKeyboardEvents(dateContainer);
        setTimeout(() => dateContainer.focus());

    }
    private addDatepickerKeyboardEvents(dateContainer) {
        dateContainer.onkeydown = (event) => {
            const action = this.keyEventPlugin.getEventFullKey(event);
            // Check for Shift+Tab key or Tab key or escape
            if (action === 'shift.tab' || action === 'tab' || action === 'escape') {
                this.hideDatepickerDropdown();
            }
        };
    }

    private hideDatepickerDropdown() {
        this.isOpen = false;
        this.deregisterEventListener();
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        setTimeout(() => displayInputElem.focus());

    }

    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    toggleDpDropdown($event) {
        if ($event.target && $($event.target).is('input') && (this.showdropdownon === 'button')) {
            return;
        }
        this.bsDatePickerDirective.toggle();
        this.addBodyClickListener(this.bsDatePickerDirective.isOpen);
    }

    private addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const bsDateContainerElement = bodyElement.querySelector(`.${this.dateContainerCls}`);
            this.deregisterEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, this.nativeElement, 'click', () => {
                this.isOpen = false;
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    /**
     * This is an internal method triggered when pressing key on the date input
     */
    private onDisplayKeydown(event) {
        const action = this.keyEventPlugin.getEventFullKey(event);
        if (action === 'enter' || action === 'arrowdown') {
            this.toggleDpDropdown(event);
        }
    }

    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {
        this.setDataValue(newVal);
    }
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'autofocus' && nv) {
            const inputElement = this.$element.find('.display-input')[0] as HTMLElement;
            setAttr(inputElement, key, nv);
        }
        super.onPropertyChange(key, nv, ov);
    }
}
