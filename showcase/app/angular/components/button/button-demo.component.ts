import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-button-demo',
    templateUrl: './button-demo.component.html',
    styleUrls: ['./button-demo.component.less']
})
export class ButtonDemoComponent implements OnInit {

    caption: string = 'Button';
    class: string = 'btn-warning';
    badge: string = '2';
    iconclass: string = 'glyphicon glyphicon-plus';

    constructor() { }

    ngOnInit() { }

}
