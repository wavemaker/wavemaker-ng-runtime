import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar-demo.component.html'
})
export class ProgressBarDemoComponent implements OnInit {

    displayformat = '9.999%';
    captionplacement = 'inside';
    minvalue = 0;
    maxvalue = 100;
    datavalue = 30;
    type = 'success-striped';

    constructor() { }

    ngOnInit() {
    }

}
