import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-checkboxset-demo',
  templateUrl: './checkboxset-demo.component.html',
  styleUrls: ['./checkboxset-demo.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class CheckboxsetDemoComponent implements OnInit {
    checkboxsetOptions = [{
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

    keys: string[] = Object.keys(this.checkboxsetOptions[0]);
    dataFieldKeys: string[] = this.keys.concat(['All Fields']);

    datafield: string = this.keys[0];

    displayfield: string = this.keys[0];

    datavalue: any = this.checkboxsetOptions[0][this.displayfield];


    layouts: string[] = ['stacked', 'inline'];
    layout: string = 'stacked';

    color: string = '#121212';

    fontsize: number = 30;

    width: string = '200px';

    height: string = '';

    show: boolean = true;

    required: boolean = false;

    disable: boolean = false;

    readonly: boolean = false;

    margin: string = '';

    tabindex: number = 0;

    displayexpression: string = '';

    orderby: string = '';

    constructor() { }

    ngOnInit() {
    }

}
