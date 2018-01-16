import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-accordion-demo',
    templateUrl: './accordion-demo.component.html',
    styleUrls: ['./accordion-demo.component.less']
})
export class AccordionDemoComponent implements OnInit {

    defaultpaneindex: number = 0;

    height: string;

    closeothers: boolean = true;

    tabindex: number = 0;

    constructor() { }

    ngOnInit() {
    }

}
