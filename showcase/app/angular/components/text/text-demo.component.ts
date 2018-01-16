import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-demo',
  templateUrl: './text-demo.component.html',
  styleUrls: ['./text-demo.component.less']
})
export class TextDemoComponent implements OnInit {

    datavalue: string = '';

    width: string = '300px';

    height: string = '';

    readonly: boolean = false;

    show: boolean = true;

    disable: boolean = false;

    required: boolean = false;

    textalign: string = 'left';

    color: string = '#121212';

    fontsize: number = 14;

    tabindex: number = 1;

    backgroundcolor: string = '#ffffff';

    hint: string = 'Enter Text';

    fontfamily: string= 'arial';

    alignments: {key: string, value: string}[] = [
        {key: 'left', value: 'left'},
        {key: 'right', value: 'right'},
        {key: 'center', value: 'center'}];

    types: {key: string, value: string}[] = [
    {key: 'color', value: 'color'},
    {key: 'date', value: 'date'},
    {key: 'datetime-local', value: 'datetime-local'},
    {key: 'email', value: 'email'},
    {key: 'month', value: 'month'},
    {key: 'number', value: 'number'},
    {key: 'password', value: 'password'},
    {key: 'search', value: 'search'},
    {key: 'Phone No', value: 'tel'},
    {key: 'text', value: 'text'},
    {key: 'time', value: 'time'},
    {key: 'url', value: 'url'},
    {key: 'week', value: 'week'},
    ];

    type: string = this.types[9].key;

    constructor() { }

    ngOnInit() {
    }
}
