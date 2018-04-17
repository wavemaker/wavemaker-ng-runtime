import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IStylableComponent } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './login-dialog.props';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { DialogService } from '../dialog.service';

const WIDGET_INFO = {widgetType: 'wm-logindialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-login-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmLoginDialog]',
    templateUrl: './login-dialog.component.html'
})
export class PartialDialogComponent extends BaseComponent implements OnInit {

    bsModalRef: BsModalRef;
    isOpen;
    dialogId: string;
    modalConfig: ModalOptions = {};
    bodyHeight: number;
    _class;
    open: Function;
    close: Function;
    content;

    get class () {
        return [defaultClass, this._class].join(' ');
    }

    set class (nv) {
        this._class = nv;
    }

    @ViewChild('loginModal') dialogTemplate: TemplateRef<any>;

    constructor(inj: Injector, private modalService: BsModalService, private dialogService: DialogService) {
        super(inj, WIDGET_INFO);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.SHELL, ['height', 'width']);
        // styler(this.nativeElement.querySelector('.app-dialog-body.modal-body'), this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    onBeforeDialogOpen() {
        this.modalConfig.class = this.class;
    }

    okButtonHandler() {
        invokeEventHandler(this, 'ok');
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
