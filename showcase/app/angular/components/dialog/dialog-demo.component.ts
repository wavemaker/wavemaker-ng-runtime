import { Component, OnInit } from '@angular/core';
import { DialogService } from '@components/widgets/dialog/dialog.service';

@Component({
    selector: 'app-dialog-demo',
    templateUrl: './dialog-demo.component.html',
    styleUrls: ['./dialog-demo.component.less']
})
export class DialogDemoComponent implements OnInit {

    constructor(private dialogService: DialogService) { }
    private iconclass: string = 'wi wi-file-text';
    private title: string = 'Information';
    private closable: boolean = true;
    private class: string = 'modal-lg';
    ngOnInit() {
    }

    onOk() {
        alert('You clicked okay button!');
    }

    onConfirmOk() {
        this.dialogService.open('alertdialog1', {oktext: 'Okay!'});
    }

}
