import { AfterViewInit, Directive, ElementRef, Injector, OnInit, OnDestroy } from '@angular/core';
import { App } from '@wm/core';

declare const $;
@Directive({
    selector: '[captionPosition]'
})
export class CaptionPositionDirective implements AfterViewInit, OnInit, OnDestroy {
    private elementRef: ElementRef;
    private inputEl;
    private nativeEl;
    private compositeEle;
    private app: App;
    private labelAnimationSubscription;
    private placeholder;
    private _attrObserver;
    private _isPlaceholderBound;

    // skip floating caption for the below form fields
    private skipFloatPositionWidgets: string[] = ['radioset', 'checkboxset', 'richtext', 'switch', 'chips', 'checkbox', 'slider', 'rating', 'toggle', 'upload'];

    constructor(inj: Injector, app: App) {
        this.elementRef = inj.get(ElementRef);
        this.nativeEl = this.elementRef.nativeElement;
        this.app = app;
    }

    private onBlurCb() { // on blur, remove animation and placeholder if there is no value
        if (!this.inputEl.val()) {
            this.compositeEle.classList.remove('float-active');
            this.inputEl.removeAttr('placeholder');
        }
    }

    private onFocusCb() { //  on focus, add animation class and the place holder
        this.compositeEle.classList.add('float-active');
        this.inputEl.attr('placeholder', this.placeholder);
    }

    // For select widget, display placeholder only on focus else remove the text of the option selected.
    private checkForSelectPlaceholder() {
        if ($(this.nativeEl).find('select option:selected').text() && !$(this.nativeEl).find('select').is(':focus') &&
            !$(this.inputEl.closest('[widget-id]')).attr('datavalue') ) {
            $(this.nativeEl).find('select option:selected').text('');
        }
    }

    private setDefaultValueAnimation() { // set animation when default values are present
        // remove placeholder when the input el has placeholder and the placeholder is not bound to any variable
        if (!this._isPlaceholderBound && this.inputEl.attr('placeholder')) {
            this.placeholder = this.inputEl.attr('placeholder');
            this.inputEl.removeAttr('placeholder');
        }
        
        // Do not show placeholder as selected by default
        this.checkForSelectPlaceholder();

        // check for datavalue attribute in composite element and defaultvalue attribute in form field element
        // check for datavalue.bind attribute to see whether default value is binded via expression or a variable
        // check for displayformat attribute, as in form fields user can set display format to the field
        // check for formdata/bindformdata attribute to see if any default value is binded to the form 
        // check for select tag with multiple attribute enabled 

        if (this.inputEl.val() || $(this.inputEl.closest('[widget-id]')).attr('datavalue') || $(this.inputEl.parent('[widget-id]')).attr('datavalue.bind') || this.nativeEl.getAttribute('defaultvalue')
            || this.nativeEl.getAttribute('displayformat') || $(this.nativeEl).find('select option:selected').text() || $(this.nativeEl).find('select').attr('multiple')) {
            this.compositeEle.classList.add('float-active');
        }
    }

    /**
     * Observing placeholder attribute change on DOM instead of having a propChangeHandler fn
     * For composite widgets propertychangehandler function is invoked at independent widgets where as the directive is at composite level
     */
    private observeForPlaceholderAttrChange() {
        this._attrObserver = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'placeholder' && this.inputEl.attr('placeholder') && !this.compositeEle.classList.contains('float-active')) {
                    this.placeholder = this.inputEl.attr('placeholder');
                    this.inputEl.removeAttr('placeholder');
                }
            });
        });
        const config = { attributes: true, childList: false, characterData: false };
        this._attrObserver.observe(this.inputEl[0], config);   
    }

    // when a form is right aligned and have input-group-btn's like date picker, time picker etc. adjust the css to not overlap the label on the icon
    private checkForRightAlignedForm() {
        const $compositeEle = $(this.compositeEle);
        if ($compositeEle.closest('.align-right').length && $compositeEle.find('.input-group-btn').length) {
            const $label = $compositeEle.find('label');
            if ($compositeEle.find('[wmdatetime]').length) { // for datetime picker, as there will be 2 icons css is different
                $label.addClass('input-grp-dt-icon');
            } else {
                $label.addClass('input-grp-icon');
            }
        }
    }

    ngAfterViewInit() {
        this.compositeEle = this.nativeEl;
        const widget = this.nativeEl.widget;
        let captionPosition: string = widget.$attrs.get('captionposition');
        if (widget.form) {
            captionPosition = widget.form.$attrs.get('captionposition');
            this.compositeEle = this.nativeEl.querySelector('.app-composite-widget');
            this._isPlaceholderBound = this.nativeEl.getAttribute('placeholder.bind');
        }
        if (captionPosition === 'floating') {
            if (widget.form) { // for form-fields remove caption-floating and replace it with caption-float or caption-top
                const widgetType: string = this.nativeEl.getAttribute('widgettype'); // fetches the form field type
                if (this.skipFloatPositionWidgets.indexOf(widgetType) > -1) {
                    this.compositeEle.classList.remove('caption-floating');
                    this.compositeEle.classList.add('caption-top');
                }
                this.checkForRightAlignedForm();
            }
            this.inputEl = $(this.nativeEl).find('input, select, textarea');
            if (!this._isPlaceholderBound) {
                this._isPlaceholderBound = this.inputEl.closest('[widget-id]').attr('placeholder.bind');
            }
            // call the below function to apply float-active class when there are default values to the fields
            setTimeout(this.setDefaultValueAnimation.bind(this), 0);

            this.inputEl.focus(this.onFocusCb.bind(this));
            this.inputEl.blur(this.onBlurCb.bind(this));

            // observe for placeholder attribute change when placeholder is bound via db variable or an expression
            if (this._isPlaceholderBound) {
                this.observeForPlaceholderAttrChange();
            }
        }
    }

    // captionPositionAnimate is only notified for date-time, time and search widgets as input el is not updated with value on selection of dropdown/popups
    ngOnInit() {
        this.labelAnimationSubscription = this.app.subscribe('captionPositionAnimate', (data) => {
            // displayVal is true when there is a value entered in the input field
            // In case of form fields, when the field is in focus, isFocused will be set as true
            // isSelectMultiple is set to true when for select widget, multiple option is enabled
            // Checking inputEl focus - when form is represented as dialog and the first field is automatically in focus
            const isInputElFocused = this.inputEl && this.inputEl.is(':focus');
            if (data.displayVal || data.isFocused || data.isSelectMultiple || isInputElFocused) {
                data.nativeEl.addClass('float-active');
                if (!data.displayVal && isInputElFocused) {
                    this.inputEl.attr('placeholder', this.placeholder);
                }
            } else {
                data.nativeEl.removeClass('float-active');
                // Remove placeholder on removing float-active, if not the label and placeholder are collided
                // before placeholder is removed assign it to the placeholder variable
                if (this.inputEl && this.inputEl.attr('placeholder')) {
                    this.placeholder = this.inputEl.attr('placeholder');
                    this.inputEl.removeAttr('placeholder');
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.labelAnimationSubscription) {
            this.labelAnimationSubscription();
        }
        if (this._attrObserver) {
            this._attrObserver.disconnect();
        }
    }
}
