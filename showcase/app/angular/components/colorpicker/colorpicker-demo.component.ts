import { Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-colorpicker-demo',
    templateUrl: './colorpicker-demo.component.html'
})
export class ColorpickerDemoComponent implements OnInit {

    datavalue: string = '#ff0000';

    readonly: boolean = false;

    show: boolean = true;

    disable: boolean = false;

    required: boolean = false;

    tabindex: number = 1;

    shortcutKey: string = 'h';

    hint: string = 'Color Picker Component';

    class: string = 'input-group-lg';

    constructor() { }

    ngOnInit() {
    }
}
