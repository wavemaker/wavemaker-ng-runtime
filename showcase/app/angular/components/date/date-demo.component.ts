import { Component } from '@angular/core';

@Component({
  selector: 'app-date-demo',
  templateUrl: './date-demo.component.html'
})
export class DateDemoComponent {
    constructor() { }

    private datavalue: string = '11/23/2017';

    private showweeks: boolean = true;

    private mindate: string = '11/10/2017';

    private maxdate: string = '11/25/2017';

    private outputformat: string = 'ddd DD MMMM YYYY';

    private datepattern: string = 'ddd MMMM';

    private show: boolean = true;

    private disabled: boolean = false;

    onModelChange = (scope, newVal, oldVal) => {
        console.log(`Value Changed from ${oldVal} to ${newVal}`);
    }
}
