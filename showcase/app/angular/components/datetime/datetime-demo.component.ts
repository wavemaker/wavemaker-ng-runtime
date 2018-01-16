import { Component } from '@angular/core';

@Component({
  selector: 'app-datetime-demo',
  templateUrl: './datetime-demo.component.html'
})
export class DatetimeDemoComponent {

    private datavalue: string = '11/23/2017';

    private showweeks: boolean = true;

    private mindate: string = '11/10/2017';

    private maxdate: string = '11/25/2017';

    private outputformat: string = 'timestamp';

    private datepattern: string = 'DD/MM/YYYY hh:mm:ss a';

    private show: boolean = true;

    private hourstep: number = 1;

    private minutestep: number = 15;

    private timepattern: string = 'hh mm ss';

    private disabled: boolean = false;

    private showseconds: boolean = true;

    onModelChange = (scope, newVal, oldVal) => {
        console.log(`Value Changed from ${oldVal} to ${newVal}`);
    }

    constructor() { }

}
