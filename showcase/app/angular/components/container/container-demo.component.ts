import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-container-demo',
    templateUrl: './container-demo.component.html',
    styleUrls: ['./container-demo.component.less']
})
export class ContainerDemoComponent implements OnInit {
    borderwidth: string;
    borderstyle: string;
    textalignstyle: {key: string, value: string}[] = [
        {key: 'left', value: 'left'},
        {key: 'right', value: 'right'},
        {key: 'center', value: 'center'},
        {key: 'justify', value: 'justify'},
        {key: 'initial', value: 'initial'},
        {key: 'inherit', value: 'inherit'}];
    borderstyles: {key: string, value: string}[] = [
        {key: 'none', value: 'none'},
        {key: 'hidden', value: 'hidden'},
        {key: 'dotted', value: 'dotted'},
        {key: 'dashed', value: 'dashed'},
        {key: 'solid', value: 'solid'},
        {key: 'double', value: 'double'},
        {key: 'groove', value: 'groove'},
        {key: 'ridge', value: 'ridge'},
        {key: 'inset', value: 'inset'},
        {key: 'outset', value: 'outset'},
        {key: 'initial', value: 'initial'},
        {key: 'inherit', value: 'inherit'}];

    constructor() { }

    ngOnInit() {
    }

}