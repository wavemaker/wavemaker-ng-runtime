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
    private attrObserver;
    private bindedPlaceholder;

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

    private setDefaultValueAnimation() { // set animation when default values are present
        if (!this.bindedPlaceholder) {
            this.placeholder = this.inputEl.attr('placeholder');
            this.inputEl.removeAttr('placeholder');
        }
        // check for datavalue attribute in composite element and defaultvalue attribute in form field element
        // check for datavalue.bind attribute to see whether default value is binded via expression or a variable
        // check for displayformat attribute, as in form fields user can set display format to the field
        // check for formdata/bindformdata attribute to see if any default value is binded to the form 
        if ($(this.inputEl.closest('[widget-id]')).attr('datavalue') || $(this.inputEl.parent('[widget-id]')).attr('datavalue.bind') ||
            this.nativeEl.getAttribute('defaultvalue') || this.nativeEl.getAttribute('displayformat') || $(this.nativeEl).find('select option:selected').text()) {
            this.compositeEle.classList.add('float-active');
        }
    }

    ngAfterViewInit() {
        this.compositeEle = this.nativeEl;
        const widget = this.nativeEl.widget;
        let captionPosition: string = widget.$attrs.get('captionposition');
        if (widget.form) {
            captionPosition = widget.form.$attrs.get('captionposition');
            this.compositeEle = this.nativeEl.querySelector('.app-composite-widget');
            this.bindedPlaceholder = this.nativeEl.getAttribute('placeholder.bind');
        }
        if (captionPosition === 'floating') {
            if (widget.form) { // for form-fields remove caption-floating and replace it with caption-float or caption-top
                const widgetType: string = this.nativeEl.getAttribute('widgettype'); // fetches the form field type
                if (this.skipFloatPositionWidgets.indexOf(widgetType) > -1) {
                    this.compositeEle.classList.remove('caption-floating');
                    this.compositeEle.classList.add('caption-top');
                }
            }
            this.inputEl = $(this.nativeEl).find('input, select, textarea');
            if (!this.bindedPlaceholder) {
                this.bindedPlaceholder = this.inputEl.closest('[widget-id]').attr('placeholder.bind');
            }
            // call the below function to apply float-active class when there are default values to the fields
            setTimeout(this.setDefaultValueAnimation.bind(this), 0);

            this.inputEl.focus(this.onFocusCb.bind(this));
            this.inputEl.blur(this.onBlurCb.bind(this));

            // observe for placeholder attribute change when placeholder is binded
            if (this.bindedPlaceholder) {
                this.attrObserver = new MutationObserver(mutations => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'placeholder' && this.inputEl.attr('placeholder') && !this.compositeEle.classList.contains('float-active')) {
                            this.placeholder = this.inputEl.attr('placeholder');
                            this.inputEl.removeAttr('placeholder');
                        }
                    });
                });
                const config = { attributes: true, childList: true, characterData: true };
                this.attrObserver.observe(this.inputEl[0], config);   
            }
        }
    }

    // captionPositionAnimate is only notified for date-time, time and search widgets as input el is not updated with value on selection of dropdown/popups
    ngOnInit() {
        this.labelAnimationSubscription = this.app.subscribe('captionPositionAnimate', (data) => {
            if (data.displayVal) {
                data.nativeEl.addClass('float-active');
            } else {
                data.nativeEl.removeClass('float-active');
                if (this.inputEl) {
                    this.inputEl.removeAttr('placeholder');
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.labelAnimationSubscription) {
            this.labelAnimationSubscription();
        }
        if (this.attrObserver) {
            this.attrObserver.disconnect();
        }
    }
}
