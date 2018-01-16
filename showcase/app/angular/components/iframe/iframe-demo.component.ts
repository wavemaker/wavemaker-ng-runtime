import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-iframe-demo',
  templateUrl: './iframe-demo.component.html',
  encapsulation: ViewEncapsulation.None
})
export class IframeDemoComponent {

    _iframesrc: string = 'https://www.wavemaker.com';

    width: string = '';

    height: string = '500px';

    _encodeurl: boolean = false;

    constructor() { }
}
