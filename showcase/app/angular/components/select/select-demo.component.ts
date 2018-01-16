import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-select-demo',
  templateUrl: './select-demo.component.html',
  styleUrls: ['./select-demo.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SelectDemoComponent implements OnInit {

    options: any[] = [{
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


    keys: string[] = Object.keys(this.options[0]);
    dataFieldKeys: string[] = this.keys.concat(['All Fields']);

    datafield: string = this.keys[0];

    displayfield: string = this.keys[0];

    datavalue: any = this.options[0][this.displayfield];

    color: string = '#121212';

    fontsize: number = 14;

    width: string = '200px';

    height: string = '';

    disable: boolean = false;

    required: boolean = false;

    hint: string = '';

    tabindex: number = 0;

    multiple: boolean = false;

    show: boolean = true;

    constructor() { }

    ngOnInit() {
    }

}
