// This is added as angular was throwing error as AppExtComponent is not found in mobile/placeholder
import { Component } from '@angular/core';

@Component({
    selector: '[wmAppExt]',
    template: `<ng-container></ng-container>`
})
export class AppExtComponent {
}
