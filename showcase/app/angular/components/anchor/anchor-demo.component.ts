import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-anchor-demo',
    templateUrl: './anchor-demo.component.html',
    styleUrls: ['./anchor-demo.component.less']
})
export class AnchorDemoComponent implements OnInit {

    caption: string = 'link';
    hyperlink: string = 'www.google.com';
    target: string = '_blank';
    iconclass: string = 'glyphicon glyphicon-plus';

    constructor() { }

    ngOnInit() { }

}
