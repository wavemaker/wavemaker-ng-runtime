import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-radioset-demo',
  templateUrl: './radioset-demo.component.html',
  styleUrls: ['./radioset-demo.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RadiosetDemoComponent implements OnInit {

    radioOptions = [{
    name: 'Eric',
    company : 'X'
    },
    {
      name: 'Bob',
      company : 'Y'
    },
    {
      name: 'Stella',
      company : 'Z'
    }];

    keys: string[] = Object.keys(this.radioOptions[0]);
    dataFieldKeys: string[] = this.keys.concat(['All Fields']);

    datafield: string = this.keys[0];

    displayfield: string = this.keys[0];

    datavalue: any = this.radioOptions[0][this.displayfield];


    layouts: string[] = ['stacked', 'inline'];
    layout: string = 'stacked';

    color: string = '#121212';

    fontsize: number = 30;

    width: string = '200px';

    height: string = '';

    displayexpression: string = '';

    margin: string = '';

    show: boolean = true;

    required: boolean = false;

    disable: boolean = false;

    readonly: boolean = false;

    orderby: string = '';

    tabindex: number = 0;

    constructor() { }

    ngOnInit() {
    }

}
