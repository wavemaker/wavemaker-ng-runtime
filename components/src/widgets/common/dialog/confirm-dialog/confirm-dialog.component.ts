import { Component, forwardRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { WidgetRef } from '../../../framework/types';
import { invokeEventHandler } from '../../../../utils/widget-utils';
import { DialogService } from '../dialog.service';
import { registerProps } from './confirm-dialog.props';
import { StylableComponent } from '../../base/stylable.component';

const WIDGET_INFO = {widgetType: 'wm-confirmdialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-confirm-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmConfirmDialog]',
    templateUrl: './confirm-dialog.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => ConfirmDialogComponent)}
    ]
})
export class ConfirmDialogComponent extends StylableComponent implements OnInit {

    bsModalRef: BsModalRef;
    isOpen;
    dialogId: string;
    modalConfig: ModalOptions = {};
    bodyHeight: number;
    _class;
    messageclass: string;
    onOk: Function;
    onCancel: Function;

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
            this,
            APPLY_STYLES_TYPE.CONTAINER,
            ['height', 'width']
        );
        styler(
            this.nativeElement.querySelector('.app-dialog-body.modal-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER
        );
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

    cancelButtonHandler() {
        invokeEventHandler(this, 'cancel');
        if (this.onCancel) {
            this.onCancel();
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
