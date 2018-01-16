import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-slider-demo',
    templateUrl: './slider-demo.component.html'
})
export class SliderDemoComponent implements OnInit {

    datavalue: number = 30;

    width: string = '300px';

    height: string = '';

    readonly: boolean = false;

    show: boolean = true;

    disable: boolean = false;

    required: boolean = false;

    tabindex: number = 1;

    hint: string = 'Slider Component';

    minvalue: number = 0;

    maxvalue: number = 100;

    step: number = 10;


    constructor() { }

    ngOnInit() {
    }

}
