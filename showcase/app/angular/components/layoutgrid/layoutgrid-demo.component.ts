import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-layoutgrid-demo',
  templateUrl: './layoutgrid-demo.component.html',
  styleUrls: ['./layoutgrid-demo.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutgridDemoComponent implements OnInit {

    backgroundcolor: string = '#ececec';
    width: string = '200px';
    height: string = '200px';

    constructor() { }

    ngOnInit() {}

}
