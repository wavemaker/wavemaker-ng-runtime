import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-spinner',
    template: `
        <div class="app-spinner" *ngIf="show">
            <div class="spinner-message" aria-label="loading gif">
                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                <span class="spinner-text" [innerHTML]="caption"></span>
            </div>
        </div>
    `
})
export class AppSpinnerComponent {
    @Input() show: boolean;
    @Input() caption: string;
    constructor() {}
}