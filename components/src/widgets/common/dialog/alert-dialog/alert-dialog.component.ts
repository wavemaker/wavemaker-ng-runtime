import { Component, forwardRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { WidgetRef } from '../../../framework/types';
import { invokeEventHandler } from '../../../../utils/widget-utils';
import { DialogService } from '../dialog.service';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './alert-dialog.props';

const WIDGET_INFO = {widgetType: 'wm-alertdialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-alert-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmAlertDialog]',
    templateUrl: './alert-dialog.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => AlertDialogComponent)}
    ]
})
export class AlertDialogComponent extends StylableComponent implements OnInit {

    bsModalRef: BsModalRef;
    isOpen;
    dialogId: string;
    modalConfig: ModalOptions = {};
    bodyHeight: number;
    _class;
    type: string;
    open: Function;
    close: Function;
    onOk: Function;

    get class () {
        return [defaultClass, this.type, this._class].join(' ');
    }

    set class (nv) {
        this._class = nv;
    }

    @ViewChild('alertModal') dialogTemplate: TemplateRef<any>;

    constructor(inj: Injector, private modalService: BsModalService, private dialogService: DialogService) {
        super(inj, WIDGET_INFO);
    }

    onBeforeDialogOpen() {
        this.modalConfig.class = this.class;
    }

    okButtonHandler() {
        invokeEventHandler(this, 'ok');
        if (this.onOk) {
            this.onOk();
        }
        this.close();
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'name':
                this.dialogId = nv;
                break;
            case 'closable':
                this.modalConfig.keyboard = nv;
                this.modalConfig.backdrop = !nv ? 'static' : nv;
                break;
        }
    }

    onStyleChange(key, nv, ov) {
        switch (key) {
            case 'width':
                if (nv) {
                    $(this.nativeElement).closest('.modal-dialog').css('width', nv);
                }
                break;
            case 'height':
                if (nv.indexOf('%') > 0) {
                    this.bodyHeight = (window.innerHeight * (parseInt(nv, 10) / 100) - 112);
                } else {
                    this.bodyHeight = parseInt('' + (nv - 112), 10);
                }
                break;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.dialogService.registerDialog(this.dialogId, this);
    }
}
