import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-tile-demo',
    templateUrl: './tile-demo.component.html',
    styleUrls: ['./tile-demo.component.less']
})
export class TileDemoComponent implements OnInit {
    width: string = '240px';
    height: string = '160px';
    bordercolor: string = '#000';
    borderstyle: string = 'dotted';
    borderwidth: string = '2px';
    textalignstyle: {key: string, value: string}[] = [
        {key: 'left', value: 'left'},
        {key: 'right', value: 'right'},
        {key: 'center', value: 'center'},
        {key: 'justify', value: 'justify'},
        {key: 'initial', value: 'initial'},
        {key: 'inherit', value: 'inherit'}];

    constructor() { }

    ngOnInit() {
    }

}