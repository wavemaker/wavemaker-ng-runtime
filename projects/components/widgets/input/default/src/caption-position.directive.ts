import { AfterViewInit, Directive, ElementRef, Injector } from '@angular/core';

declare const $;

@Directive({
    selector: '[captionPosition]'
})
export class CaptionPositionDirective implements AfterViewInit {
    private elementRef: ElementRef;
    private inputEl: JQuery;
    private labelEl: JQuery;
    constructor(inj: Injector) {
        this.elementRef = inj.get(ElementRef);
    }

    private onBlurCb() {
        if (!this.inputEl.val()) {
            this.labelEl.removeClass('active');
            this.labelEl.parent().removeClass('label-grp-margin');
            this.inputEl.removeAttr('placeholder');
        }
    }

    private onFocusCb(placeholder) {
        this.labelEl.addClass('active');
        this.labelEl.parent().addClass('label-grp-margin');
        this.inputEl.attr('placeholder', placeholder);
    }

    private setDefaultValueAnimation() {
        this.inputEl.removeAttr('placeholder');
        if (this.inputEl.parent().attr('datavalue') || $(this.elementRef.nativeElement).parent().attr('defaultvalue') ||
            $(this.elementRef.nativeElement).find('select option:selected').text()) {
            this.labelEl.addClass('active');
            this.labelEl.parent().addClass('label-grp-margin');
        }
    }

    ngAfterViewInit() {
        const isCaptionFloating: boolean = $(this.elementRef.nativeElement).hasClass('caption-floating');
        const captionPosition: string = $(this.elementRef.nativeElement).attr('captionposition');
        // skip floating caption for the below form fields
        const skipFloatPositionWidgets: string[] = ['autocomplete', 'radioset', 'checkboxset', 'richtext', 'switch', 'chips', 'checkbox', 'slider', 'rating', 'toggle', 'upload'];
        if (captionPosition === 'floating' || isCaptionFloating) {
            if (isCaptionFloating) {
                const widgetType: string = $(this.elementRef.nativeElement).parent().attr('widgettype');
                $(this.elementRef.nativeElement).removeClass('caption-floating');
                if (skipFloatPositionWidgets.indexOf(widgetType) > -1) {
                    $(this.elementRef.nativeElement).addClass('caption-top')
                } else {
                    $(this.elementRef.nativeElement).addClass('caption-float')
                }
            }
            this.inputEl = $(this.elementRef.nativeElement).find('input, select, textarea');
            this.labelEl = $(this.elementRef.nativeElement).find('.control-label');
            if ($(this.elementRef.nativeElement).hasClass('caption-float') || captionPosition === 'floating') {
                const placeholder = this.inputEl.attr('placeholder');
                this.inputEl.attr('placeholdertxt', placeholder);
                setTimeout(this.setDefaultValueAnimation.bind(this), 0);
                this.inputEl.focus(this.onFocusCb.bind(this, placeholder));
                this.inputEl.blur(this.onBlurCb.bind(this));
            }
        }
    }
}
