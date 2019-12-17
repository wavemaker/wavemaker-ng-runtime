import {AfterViewInit, Directive, ElementRef, Injector, Input, OnInit} from '@angular/core';
@Directive({
    selector: '[renderComponent]'
})
export class RenderComponentDirective implements OnInit {
    private elementRef;
    @Input() public customclass;
    @Input() public item;
    constructor(inj: Injector) {
        this.elementRef = inj.get(ElementRef);
    }
    ngOnInit(): void {
        this.customclass.init(this.item);
        this.elementRef.nativeElement.appendChild(this.customclass.getElement());
        if (this.item.fieldDef && this.item.fieldDef.datavalue) {
            this.customclass.setValue(this.item.fieldDef.datavalue);
        }
    }
}
