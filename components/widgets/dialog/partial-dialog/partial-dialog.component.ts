import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './partial-dialog.props';
import { APPLY_STYLES_TYPE, styler } from '../../../utils/styler';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { DialogService } from '../dialog.service';

const WIDGET_INFO = {widgetType: 'wm-pagedialog', hostClass: ''};

const defaultClass = 'app-dialog modal-dialog app-page-dialog';

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmPartialDialog]',
    templateUrl: './partial-dialog.component.html'
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

    @ViewChild('partialModal') dialogTemplate: TemplateRef<any>;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private modalService: BsModalService, private dialogService: DialogService) {
        super(WIDGET_INFO, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL, ['height', 'width']);
        // styler(this.$element.querySelector('.app-dialog-body.modal-body'), this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
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
