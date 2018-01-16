import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-toggle-demo',
    templateUrl: './toggle-demo.component.html',
    styleUrls: ['./toggle-demo.component.less']
})
export class ToggleDemoComponent implements OnInit {

    datavalue: boolean = true;

    width: string = '120px';

    height: string = '60px';

    tabindex: string;

    shortcutKey: string;

    show: boolean = true;

    checkedvalue: string = 'checked';

    uncheckedvalue: string = 'unchecked';

    hint: string = 'Sample text';


    constructor() {
    }

    ngOnInit() {
    }
}
