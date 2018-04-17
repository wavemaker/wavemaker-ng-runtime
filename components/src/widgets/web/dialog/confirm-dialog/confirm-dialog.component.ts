import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { IStylableComponent } from '../../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { BaseComponent } from '../../base/base.component';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { DialogService } from '../dialog.service';
import { registerProps } from './confirm-dialog.props';

const WIDGET_INFO = {widgetType: 'wm-confirmdialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-confirm-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmConfirmDialog]',
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent extends BaseComponent implements OnInit {

    bsModalRef: BsModalRef;
    isOpen;
    dialogId: string;
    modalConfig: ModalOptions = {};
    bodyHeight: number;
    _class;
    messageclass: string;

    get class () {
        return [defaultClass, this.messageclass, this._class].join(' ');
    }

    set class (nv) {
        this._class = nv;
    }

    close;

    @ViewChild('confirmModal') dialogTemplate: TemplateRef<any>;

    constructor(inj: Injector, private modalService: BsModalService, private dialogService: DialogService) {
        super(inj, WIDGET_INFO);
        // TODO: Get the modal element reference
        styler(
            this.nativeElement,
            this as IStylableComponent,
            APPLY_STYLES_TYPE.CONTAINER,
            ['height', 'width']
        );
        styler(
            this.nativeElement.querySelector('.app-dialog-body.modal-body') as HTMLElement,
            this as IStylableComponent,
            APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER
        );
    }

    onBeforeDialogOpen() {
        this.modalConfig.class = this.class;
    }

    okButtonHandler() {
        invokeEventHandler(this, 'ok');
        this.close();
    }

    cancelButtonHandler() {
        invokeEventHandler(this, 'cancel');
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
