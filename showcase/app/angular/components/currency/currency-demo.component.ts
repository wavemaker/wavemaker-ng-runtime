import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-currency-demo',
    templateUrl: './currency-demo.component.html'
})
export class CurrencyDemoComponent implements OnInit {

    datavalue: number = 30;

    width: string = '300px';

    height: string = '';

    readonly: boolean = false;

    show: boolean = true;

    disable: boolean = false;

    required: boolean = false;

    textalign: string = 'left';

    color: string = '#121212';

    fontsize: number = 30;

    tabindex: number = 1;

    backgroundcolor: string = '#ffffff';

    hint: string = 'Currency Component';

    fontfamily: string= 'arial';

    minvalue: number = 25;

    maxvalue: number = 35;

    currency: string = 'INR';

    constructor() { }

    ngOnInit() {
    }

}
