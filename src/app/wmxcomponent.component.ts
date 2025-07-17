import { Component, Input } from '@angular/core';

@Component({
  selector: 'wmx-component',
  template: `
    <div class="app-wmx-component app-container">
      <span>This WMXComponent is a placeholder for third-party integrations.</span>
    </div>
  `,
  styles: [`
    .app-wmx-component {
      background: #666;
      color: #fff;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  `]
})
export class WmxComponent {
  @Input() config: any;
} 