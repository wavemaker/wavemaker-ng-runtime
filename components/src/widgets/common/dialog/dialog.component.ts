import { Component, ContentChild, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { DialogService } from './dialog.service';
import { DialogActionsComponent } from './dialog-actions/dialog-actions.component';
import { registerProps } from './dialog.props';
import { StylableComponent } from '../base/stylable.component';

declare const $;

const WIDGET_INFO = {widgetType: 'wm-dialog', hostClass: ''};

registerProps();

@Component({
    selector: 'div[wmDialog]',
    templateUrl: './dialog.component.html'
})
export class DialogComponent extends StylableComponent implements OnInit {

    dialogId: any;
    dialogWidth: any;
    modalConfig: ModalOptions = {};
    isOpen: boolean;
    open: Function;
    bodyHeight;
    close: Function;
    class: string;
    /*modal reference*/
    bsModalRef: BsModalRef;

    actiontitle;
    actionlink;
    contentclass;

    @ViewChild('modalTemplate') dialogTemplate: TemplateRef<any>;

    @ContentChild(DialogActionsComponent) dialogActionsComponent;

    constructor(inj: Injector, public modalService: BsModalService, private dialogService: DialogService) {
        super(inj, WIDGET_INFO);
        styler(
            this.nativeElement,
            this,
            APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER,
            ['width']
        );
    }

    onBeforeDialogOpen() {
        this.modalConfig.class =  this.class;
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'name':
                this.dialogId = nv;
                if (this.dialogActionsComponent) {
                    this.dialogActionsComponent.dialogId = nv;
                }
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
        this.dialogId = this.dialogService.registerDialog(this.dialogId, this);
    }
}
