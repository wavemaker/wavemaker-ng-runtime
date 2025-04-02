import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    template: `<ng-content></ng-content>`,
    imports: [CommonModule],
    selector: 'bootstrap-wrapper',
})
export class BootstrapWrapperComponent { }