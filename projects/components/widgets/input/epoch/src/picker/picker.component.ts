import { WmComponentsModule } from "@wm/components/base";
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Injector, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';

declare const $;

@Component({
  standalone: true,
  imports: [WmComponentsModule],
    selector: 'wm-pickergroup',
    template: `
        <div class="app-picker-group">
            <ng-content></ng-content>
        </div>
    `
})
export class PickerGroupComponent {

}

@Component({
    selector: 'wm-picker',
    standalone: true,
    template: `
        <div class="app-picker">
          <div class="app-picker-option-container">
            <div class="app-picker-option app-picker-empty-option">E</div>
            <div class="app-picker-option app-picker-empty-option">E</div>
            @for (option of options; track option; let i = $index) {
              <div class="app-picker-option">
                {{option.label}}
              </div>
            }
            <div class="app-picker-option app-picker-empty-option">E</div>
            <div class="app-picker-option app-picker-empty-option">E</div>
          </div>
          <div class="app-picker-ruler"></div>
        </div>
        `
})
export class PickerComponent implements AfterViewInit {

    public $el;

    private pickerAnimator;

    @Output() change = new EventEmitter<{
        label: string,
        value?: any
    }>();

    private _selectedIndex = 0;

    private _selectedValue: any;

    private _options: Array<{label: string, value?: any}> = [];

    noOfEmptyElements = 2;

    constructor(protected inj: Injector) {
        this.$el =  $(inj.get(ElementRef).nativeElement);
    }

    @Input()
    set selectedValue(s: string) {
        this._selectedValue = s;
        this.reRender();
    }

    get selectedValue() {
        return this._selectedValue;
    }

    @Input()
    set options(opts:  Array<{label: string, value?: any}>) {
        this._options = opts.map(o => ({
            label: o.label,
            value: o.value !== undefined ? o.value : o.label
        }));
        this.reRender();
    }

    get options() {
        return this._options;
    }

    reRender() {
        this._selectedIndex = this.options.findIndex(o => o.value === this.selectedValue);
        this.pickerAnimator?.select(this._selectedIndex + this.noOfEmptyElements);
    }

    set selectedIndex(i: number) {
        this._selectedIndex = i;
        this._selectedValue = this.options[i].value;
        this.change.emit(this.options[i]);
    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    ngAfterViewInit(): void {
        this.pickerAnimator = new PickerAnimator(this);
    }

}

class PickerAnimator {

    constructor(private picker: PickerComponent) {
        let lastSelectedIndex = picker.selectedIndex + picker.noOfEmptyElements;
        const computeIndex = (d: number) => lastSelectedIndex + Math.floor(d / 16);
        this.select(lastSelectedIndex);
        this.getElement().swipey({
            'direction': $.fn.swipey.DIRECTIONS.VERTICAL,
            'threshold': 10,
            'target': picker.$el,
            'onSwipe': (e, data) => {
                this.select(computeIndex(-1 * data.length));
            },
            'onSwipeEnd': (e, data) => {
                const nextSelectedIndex = computeIndex(-1 * data.length);
                this.select(nextSelectedIndex);
                lastSelectedIndex = picker.selectedIndex + picker.noOfEmptyElements;
            }
        });
    }

    getElement() {
        return this.picker.$el.find('.app-picker-option-container:first');
    }

    getOptionElements() {
        return this.getElement().find('.app-picker-option');
    }

    select(selectedIndex: number) {
        const options = this.getOptionElements();
        if (selectedIndex < this.picker.noOfEmptyElements
            || selectedIndex >= options.length - this.picker.noOfEmptyElements) {
            return;
        }
        this.getElement()
            .find('.app-picker-option.app-picker-option-selected')
            .removeClass('app-picker-option-selected');
        options.eq(selectedIndex).addClass('app-picker-option-selected');
        this.picker.selectedIndex = selectedIndex - this.picker.noOfEmptyElements;
        const minIndex = selectedIndex - this.picker.noOfEmptyElements;
        const maxIndex = selectedIndex + this.picker.noOfEmptyElements;
        options.each((i, e) => {
            if (i >= minIndex && i <= maxIndex) {
                const rotation = (i - selectedIndex) * 30;
                const opacity = 1 - Math.abs(i - selectedIndex) * 0.3;
                $(e).css({
                    transform : 'perspective(500px) rotateX(' + rotation + 'deg)',
                    opacity: opacity
                }).show();
            } else {
                $(e).hide();
            }
        });
    }
}
