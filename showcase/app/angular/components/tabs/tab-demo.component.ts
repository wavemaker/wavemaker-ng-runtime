import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-tab-demo',
    templateUrl: './tab-demo.component.html',
    styleUrls: ['./tab-demo.component.less']
})
export class TabDemoComponent implements OnInit {

    tabsposition: string = 'top';

    tabPositions: string[] = ['top', 'right', 'bottom', 'left'];

    height: string = '200px';

    defaultPaneIndex: number = 0;

    constructor() { }

    ngOnInit() { }

}
