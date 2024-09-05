import {AfterViewInit, Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR} from '@angular/forms';

import {DataSource, removeAttr, setAttr} from '@wm/core';
import {provideAs, provideAsWidgetRef, styler} from '@wm/components/base';
import {DatasetAwareFormComponent} from '../dataset-aware-form.component';

import {registerProps} from './select.props';

const WIDGET_CONFIG = {widgetType: 'wm-select', hostClass: 'app-select-wrapper'};

@Component({
    selector: 'wm-select',
    templateUrl: './select.component.html',
    providers: [
        provideAs(SelectComponent, NG_VALUE_ACCESSOR, true),
        provideAs(SelectComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(SelectComponent)
    ]
})
export class SelectComponent extends DatasetAwareFormComponent implements AfterViewInit {
    static initializeProps = registerProps();

    public readonly: boolean;
    public placeholder: string;
    public navsearchbar: any;
    public class: any;
    public required: boolean;
    public disabled: boolean;
    public tabindex: any;
    public name: string;
    public autofocus: boolean;
    public hint: string;

    @ViewChild('select', { static: true, read: ElementRef }) selectEl: ElementRef;

    set datasource(ds) {
        if (ds && ds.execute && ds.execute(DataSource.Operation.IS_BOUND_TO_LOCALE)) {
            this.datavalue = ds.execute(DataSource.Operation.GET_DEFAULT_LOCALE);
        }
    }

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.acceptsArray = true;

        /*
        * When the dataset for a select element is updated and no longer includes the previously selected value:
        * The select element becomes empty, and the ngModel value is updated to reflect this change.
        * However, the change event is not triggered, preventing the form control from recognizing the update and applying necessary validations.
        * As this widget implements ControlValueAccessor, manually updating the ngModel (or modelByKey) is necessary to ensure correct form behavior.
        * */
        const datasetSubscription = this.dataset$.subscribe(() => {
            if (this.datavalue) {
                const selectedItem = this.datasetItems.find(item => item.selected);
                if (!selectedItem) {
                    setTimeout(() => {
                        if(!this.placeholder) {
                            this.selectEl.nativeElement.value = '';
                        }
                        this.modelByKey = undefined;
                    }, 100);
                }
            } else {
                setTimeout(() => {
                    if(!this.placeholder) {
                        this.selectEl.nativeElement.value = '';
                    }
                }, 100);
            }
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.selectEl.nativeElement as HTMLElement, this);
    }

    // Change event is registered from the template, Prevent the framework from registering one more event
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (!['blur', 'change'].includes(eventName)) {
            super.handleEvent(this.selectEl.nativeElement, eventName, eventCallback, locals);
        }
    }

    onSelectValueChange($event) {
        if (this.readonly) {
            if (this.placeholder) {
                this.selectEl.nativeElement.value = this.placeholder;
            } else {
                this.selectEl.nativeElement.value = '';
            }
            this.datavalue = (this as any).prevDatavalue;
            return;
        }
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'required')  {
            this._onChange(this.datavalue);
            return;
        }
        if (key === 'class' ||  key === 'tabindex') {
            if(key === 'class') {
                // After NG15 upgrade ng-invalid class is added even the field is valid, so we are removing the ng-invalid manually
                const isNgUntouchedValid = this.selectEl.nativeElement.classList.contains('ng-untouched') && this.selectEl.nativeElement.classList.contains('ng-valid')
                if(isNgUntouchedValid && nv.includes('ng-untouched') && nv.includes('ng-invalid')) {
                    setTimeout(()=> {
                        if(this.selectEl.nativeElement.classList.contains('ng-untouched') && this.selectEl.nativeElement.classList.contains('ng-valid') && this.selectEl.nativeElement.classList.contains('ng-invalid')) {
                            this.selectEl.nativeElement.classList.remove('ng-invalid');
                        }
                    });
                }
            }
            return;
        } else if (key === 'readonly') {
             (nv === true) ? setAttr(this.selectEl.nativeElement, 'readonly', 'readonly') : removeAttr(this.selectEl.nativeElement, 'readonly') ;
        }
        super.onPropertyChange(key, nv, ov);
    }

    /**
     * When caption floating is enabled and placeholder is given, do not show placeholder until user focuses on the field
     * When focused add the placeholder to the option which is selected
     * On blur, remove the placeholder and do not animate the label
     * @param $event event received will be either a blur or focus event
     */
    checkForFloatingLabel($event) {
        const captionEl = $(this.selectEl.nativeElement).closest('.app-composite-widget.caption-floating');
        if(!this.placeholder) {
            this.removePlaceholderOption();
        }
        if (captionEl.length > 0) {
            const placeholderOption = this.selectEl.nativeElement.querySelector('#placeholderOption');
            if ($event.type === 'mousedown' && (!this.datavalue || (this.datavalue && $(this.selectEl).find('select option:selected').text() === '' && this.placeholder))) {
                if(this.placeholder) {
                    placeholderOption.textContent = this.placeholder;
                }
            } else if (!this.datavalue) {
                if(this.placeholder) {
                    placeholderOption.textContent = '';
                }
                captionEl.removeClass('float-active');
            }
        }
    }

    /*
    * Removing the placeholder option if no placeholder is provided.
    * In html we are hiding the placeholder option using css but in Apple devices and safari option is showing.
    * Styles are not allowed on option tag in ios safari
    * After removing the option, if no datavalue is present and native select element sets value to the first option by default, so we are setting it to empty
    * */
    private removePlaceholderOption() {
        const hiddenEle = $(this.selectEl.nativeElement).find('#placeholderOption');
        if (hiddenEle.length) {
            hiddenEle.remove();
            if(!this.datavalue) {
                this.selectEl.nativeElement.value = '';
            }
        }
    }
}
