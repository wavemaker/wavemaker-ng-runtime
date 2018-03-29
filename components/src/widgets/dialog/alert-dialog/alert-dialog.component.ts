import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './alert-dialog.props';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { DialogService } from '../dialog.service';

const WIDGET_INFO = {widgetType: 'wm-alertdialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-alert-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmAlertDialog]',
    templateUrl: './alert-dialog.component.html'
})
export class AlertDialogComponent extends BaseComponent implements OnInit {

    bsModalRef: BsModalRef;
    isOpen;
    dialogId: string;
    modalConfig: ModalOptions = {};
    bodyHeight: number;
    _class;
    type: string;
    open: Function;
    close: Function;

    get class () {
        return [defaultClass, this.type, this._class].join(' ');
    }

    set class (nv) {
        this._class = nv;
    }

    @ViewChild('alertModal') dialogTemplate: TemplateRef<any>;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private modalService: BsModalService, private dialogService: DialogService) {
        super(WIDGET_INFO, inj, elRef, cdr);
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
                    $(this.$element).closest('.modal-dialog').css('width', nv);
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
