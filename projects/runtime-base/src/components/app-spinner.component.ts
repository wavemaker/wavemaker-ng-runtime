import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
    selector: 'app-spinner',
    template: `
        @if (show) {
          <div class="app-spinner" [ngClass]="classname">
            <div class="spinner-message">
              <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
              <div class="spinner-messages">
                @for (value of spinnermessages; track value) {
                  <p [textContent]="value"></p>
                }
              </div>
            </div>
          </div>
        }
        `
})
export class AppSpinnerComponent {
    @Input() show: boolean;
    @Input() spinnermessages: Array<string>;
    @Input() classname: string;
    @Input() arialabel: string;
    constructor() {}
}
