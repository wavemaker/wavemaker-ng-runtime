import { AfterViewInit, Directive, ElementRef, Injector } from '@angular/core';

declare const $;
@Directive({
    selector: '[captionPosition]'
})
export class CaptionPositionDirective implements AfterViewInit {
    private elementRef: ElementRef;
    private inputEl;
    private nativeEl;
    private classList;
    constructor(inj: Injector) {
        this.elementRef = inj.get(ElementRef);
        this.nativeEl = this.elementRef.nativeElement;
        this.classList = this.nativeEl.classList;
    }

    private onBlurCb() { // on blur event
        if (!this.inputEl.val()) {
            this.classList.remove('float-active');
            this.inputEl.removeAttr('placeholder');
        } 
    }

    private onFocusCb(placeholder) { //  on focus event
        this.classList.add('float-active');
        this.inputEl.attr('placeholder', placeholder);
    }

    private setDefaultValueAnimation() { // set animation when default values are present
        this.inputEl.removeAttr('placeholder');
        if (this.inputEl.parent().attr('datavalue') || this.nativeEl.parentNode.getAttribute('defaultvalue') ||
           $(this.nativeEl).find('select option:selected').text()) {
            this.classList.add('float-active');
        }
    }

    ngAfterViewInit() {
        const isCaptionFloating: boolean = this.classList.contains('caption-floating'); // const for form-fields
        const captionPosition: string = this.nativeEl.getAttribute('captionposition'); // const for composite widgets
        // skip floating caption for the below form fields
        const skipFloatPositionWidgets: string[] = ['radioset', 'checkboxset', 'richtext', 'switch', 'chips', 'checkbox', 'slider', 'rating', 'toggle', 'upload'];
        if (captionPosition === 'floating' || isCaptionFloating) {
            if (isCaptionFloating) { // for form-fields remove caption-floating and replace it with caption-float or caption-top
                const widgetType: string = this.nativeEl.parentNode.getAttribute('widgettype'); // fetches the form field type
                this.classList.remove('caption-floating');
                if (skipFloatPositionWidgets.indexOf(widgetType) > -1) {
                    this.classList.add('caption-top')
                } else {
                    this.classList.add('caption-float')
                }
            }
            this.inputEl = $(this.nativeEl).find('input, select, textarea');
            if (this.classList.contains('caption-float') || captionPosition === 'floating') {
                const placeholder = this.inputEl.attr('placeholder');
                this.inputEl.attr('placeholdertxt', placeholder); //  maintaining a new attribute to store placeholder value
                setTimeout(this.setDefaultValueAnimation.bind(this), 0);
                this.inputEl.focus(this.onFocusCb.bind(this, placeholder));
                this.inputEl.blur(this.onBlurCb.bind(this));
            }
        }
    }
}
