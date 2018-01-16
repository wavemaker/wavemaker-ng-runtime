import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dialog-demo',
    templateUrl: './dialog-demo.component.html',
    styleUrls: ['./dialog-demo.component.less']
})
export class DialogDemoComponent implements OnInit {

    constructor() { }
    private iconclass: string = 'wi wi-file-text';
    private title: string = 'Information';
    private closable: boolean = true;
    private class: string = 'modal-lg';
    ngOnInit() {
    }

}
