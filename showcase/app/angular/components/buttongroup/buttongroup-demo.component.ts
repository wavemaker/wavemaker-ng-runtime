import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-buttongroup-demo',
  templateUrl: './buttongroup-demo.component.html',
  styleUrls: ['./buttongroup-demo.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ButtongroupDemoComponent implements OnInit {

    show: boolean = true;
    vertical: boolean = false;
    width: string = '';

    constructor() { }

    ngOnInit() {
    }

}
