import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-icon-demo',
    templateUrl: './icon-demo.component.html',
    styleUrls: ['./icon-demo.component.less']
})
export class IconDemoComponent implements OnInit {

    caption: string = 'link';
    iconposition: string = 'right';
    iconclass: string = 'glyphicon glyphicon-plus';

    constructor() { }

    ngOnInit() { }

}
