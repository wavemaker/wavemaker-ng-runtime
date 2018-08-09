import { Injector, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { AbstractDialogService } from '@wm/core';

import { IDialog, IWidgetConfig } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';

export abstract class BaseDialog extends BaseComponent implements IDialog {

    public name: string;

    private readonly dialogService: AbstractDialogService;
    private readonly bsModal: BsModalService;

    private dialogRef: BsModalRef;

    private isOpened = false;

    protected constructor(
        inj: Injector,
        widgetConfig: IWidgetConfig,
        protected modalOptions: ModalOptions
    ) {
        super(inj, widgetConfig);
        this.dialogService = inj.get(AbstractDialogService);
        this.bsModal = inj.get(BsModalService);
    }

    /**
     * Opens the dialog
     * Subscribe to the onShown event emitter of bsModal and trigger on-opened event callback
     */
    public open(initState?: any) {
        if (this.isOpened) {
            return;
        }
        const showSubscription = this.bsModal.onShown.subscribe(() => {

            const hideSubscription = this.bsModal.onHidden.subscribe(() => {
                if (!this.isOpened) {
                    return;
                }
                this.isOpened = false;
                this.invokeEventCallback('close');
                hideSubscription.unsubscribe();
            });

            this.invokeEventCallback('opened', {$event: {type: 'opened'}});
            showSubscription.unsubscribe();
        });

        // extend the context with the initState
        Object.assign(this.context, initState);

        this.dialogRef = this.bsModal.show(this.getTemplateRef(), this.modalOptions);
        this.isOpened = true;
    }

    /**
     * closes the dialog
     * invokes the on-close event callback
     */
    public close() {
        if (!this.isOpened) {
            return;
        }
        this.dialogRef.hide();
    }

    /**
     * Register the dialog with the dialog service for programmatic access
     */
    protected register() {
        this.dialogService.register(this.name, this);
    }

    /**
     * subclasses of BaseDialog must implement this method to return the proper template element ref
     * bsModal will use this refence to open the dialog
     * @returns {TemplateRef<any>}
     */
    protected abstract getTemplateRef(): TemplateRef<any>;

    protected onPropertyChange(key: string, nv: any, ov?: any) {
        // ignore the class attribute.
        // Prevent the framework from setting the class on the host element.
        if (key === 'class' || key === 'name' || key === 'tabindex') {
            return;
        } else if (key === 'animation') {
            this.modalOptions.class = this.modalOptions.class.replace('animated ' + ov, '');
            if (nv) {
                this.modalOptions.class = this.modalOptions.class + 'animated ' + nv;
            }
        }
        super.onPropertyChange(key, nv, ov);
    }
}

// Todo:Bandhavya - handle DeviceServie.onBackButtonTap
// DeviceService.onBackButtonTap(function () {
// dialogCtrl._CancelButtonHandler();
// return false;
// });