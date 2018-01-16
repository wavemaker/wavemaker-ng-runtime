import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-textarea-demo',
  templateUrl: './textarea-demo.component.html',
  styleUrls: ['./textarea-demo.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class TextareaDemoComponent implements OnInit {

    datavalue: string = '';

    width: string = '300px';

    height: string = '';

    readonly: boolean = false;

    disable: boolean = false;

    required: boolean = false;

    show: boolean = true;

    color: string = '#121212';

    fontsize: number = 14;

    tabindex: number = 1;

    backgroundcolor: string = '#ffffff';

    hint: string = 'Enter Text';

    fontfamily: string= 'arial';

    textalign: string = 'left';

    alignments: {key: string, value: string}[] = [
        {key: 'left', value: 'left'},
        {key: 'right', value: 'right'},
        {key: 'center', value: 'center'}];

    constructor() { }

    ngOnInit() {
    }

}
