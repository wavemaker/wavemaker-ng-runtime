import { AfterViewInit, Directive, ElementRef, Injector } from '@angular/core';

declare const $;
@Directive({
    selector: '[captionPosition]'
})
export class CaptionPositionDirective implements AfterViewInit {
    private elementRef: ElementRef;
    private inputEl;
    private nativeEl;
    private compositeEle;
    
    // skip floating caption for the below form fields
    private skipFloatPositionWidgets: string[] = ['radioset', 'checkboxset', 'richtext', 'switch', 'chips', 'checkbox', 'slider', 'rating', 'toggle', 'upload'];

    constructor(inj: Injector) {
        this.elementRef = inj.get(ElementRef);
        this.nativeEl = this.elementRef.nativeElement;
    }

    private onBlurCb() { // on blur, remove animation and placeholder if there is no value
        if (!this.inputEl.val()) {
            this.compositeEle.classList.remove('float-active');
            this.inputEl.removeAttr('placeholder');
        } 
    }

    private onFocusCb(placeholder) { //  on focus, add animation class and the place holder
        this.compositeEle.classList.add('float-active');
        this.inputEl.attr('placeholder', placeholder);
    }

    private setDefaultValueAnimation() { // set animation when default values are present
        this.inputEl.removeAttr('placeholder');
        // check for datavalue attribute in composite element and defaultvalue attribute in form field element
        if ($(this.inputEl.parent('[widget-id]')).attr('datavalue') || this.nativeEl.getAttribute('defaultvalue') ||
           $(this.nativeEl).find('select option:selected').text()) {
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
            // call the below function to apply float-active class when there are default values to the fields
            setTimeout(this.setDefaultValueAnimation.bind(this), 0);
            this.inputEl.focus(this.onFocusCb.bind(this, this.inputEl.attr('placeholder')));
            this.inputEl.blur(this.onBlurCb.bind(this));
        }
    }
}
