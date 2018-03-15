import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-switch-demo',
    templateUrl: './switch-demo.component.html',
    styleUrls: ['./switch-demo.component.less']
})
export class SwitchDemoComponent implements OnInit {

    options: any[] = [{
        name: 'Eric',
        company : 'X',
        iconclass: 'fa fa-bars'
    },
    {
        name: 'Bob',
        company : 'Y',
        iconclass: 'fa fa-book'
    },
    {
        name: 'Stella',
        company : 'Z',
        iconclass: 'fa fa-search'
    }];


    keys: string[] = Object.keys(this.options[0]);
    dataFieldKeys: string[] = this.keys.concat(['All Fields']);

    datafield: string = this.keys[0];

    displayfield: string = this.keys[0];

    orderby: string = this.keys[0];

    datavalue: any = this.options[0][this.displayfield];

    iconclass: any = this.keys[2];

    constructor() { }

    ngOnInit() { }

    onChange($event, widget, newVal, oldVal) {
        console.log($event, widget, newVal, oldVal);
    }

}
