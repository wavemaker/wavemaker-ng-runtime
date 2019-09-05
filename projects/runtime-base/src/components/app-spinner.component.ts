import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-spinner',
    template: `
        <div class="app-spinner" [ngClass]="classname" *ngIf="show">
            <div class="spinner-message" aria-label="loading gif">
                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                <div class="spinner-messages">
                    <p *ngFor="let value of spinnermessages" [textContent]="value"></p>
                </div>
            </div>
        </div>
    `
})
export class AppSpinnerComponent {
    @Input() show: boolean;
    @Input() spinnermessages: Array<string>;
    @Input() classname: string;
    constructor() {}
}
