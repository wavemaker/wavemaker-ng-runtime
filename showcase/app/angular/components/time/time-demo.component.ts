import { Component } from '@angular/core';

@Component({
  selector: 'app-time-demo',
  templateUrl: './time-demo.component.html'
})
export class TimeDemoComponent {
  constructor() { }

  private datavalue: string = 'CURRENT_TIME';

  private hourstep: number = 1;

  private minutestep: number = 15;

  private outputformat: string = 'HH mm ss a';

  private timepattern: string = 'hh mm ss';

  private show: boolean = true;

  private disabled: boolean = false;

  private showseconds: boolean = true;

}
