import { Injector, OnDestroy, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';

import { AbstractDialogService, closePopover } from '@wm/core';

import { IDialog, IWidgetConfig } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';

declare const _;

let eventsRegistered = false;

const findRootContainer = ($el) => {
    let root = $el.closest('.app-prefab');
    if (!root.length) {
        root = $el.closest('.app-partial');
    }
    if (!root.length) {
        root = $el.closest('.app-page');
    }
    return root.length && root.parent()[0].tagName;
};

const invokeOpenedCallback = (ref) => {
    if (ref) {
        setTimeout(() => {
            const root = findRootContainer(ref.$element);
            // if page styles have to be applied to dialog then dialog has to be child of page element.
            if (root) {
                $('body:first > modal-container > div').wrap('<' + root + '/>');
            }
            ref.invokeEventCallback('opened', {$event: {type: 'opened'}});
        });
    }
};

const invokeClosedCallback = (ref) => {
    if (ref) {
        ref.invokeEventCallback('close');
        ref.dialogRef = undefined;
    }
};

export abstract class BaseDialog extends BaseComponent implements IDialog, OnDestroy {

    public name: string;

    private readonly dialogService: AbstractDialogService;
    private readonly bsModal: BsModalService;

    private dialogRef: BsModalRef;

    protected constructor(
        inj: Injector,
        widgetConfig: IWidgetConfig,
        protected modalOptions: ModalOptions
    ) {
        super(inj, widgetConfig);
        this.dialogService = inj.get(AbstractDialogService);
        this.bsModal = inj.get(BsModalService);

        // Subscribe to onShown and onHidden events only once as we will not be
        // unsubscribing to the,m ever and we will handle the logic of calling
        // respective dialog callbacks.
        if (!eventsRegistered) {
            eventsRegistered = true;
            this.bsModal.onShown.subscribe(() => {
                // Always get the reference of last pushed dialog in the array for calling onOpen callback
                invokeOpenedCallback(this.dialogService.getLastOpenedDialog());
            });

            this.bsModal.onHidden.subscribe((closeReason) => {
                const ref = closeReason === 'esc' || closeReason === 'backdrop-click' ? this.dialogService.getLastOpenedDialog() : this.dialogService.getDialogRefFromClosedDialogs();
                // remove the dialog reference from opened dialogs and closed dialogs
                this.dialogService.removeFromOpenedDialogs(ref);
                this.dialogService.removeFromClosedDialogs(ref);
                invokeClosedCallback(ref);
            });
        }
    }

    /**
     * Opens the dialog
     * Subscribe to the onShown event emitter of bsModal and trigger on-opened event callback
     */
    public open(initState?: any) {

        // remove the popovers in the page to avoid the overlap with dialog
        // closePopover(this.$element); Commenting this line because it is causing regression(if we have dialog inside popover as partail content, then the dialog close is not working because on closing the popover the partial get destroyed.)

        // do not open the dialog again if it is already opened
        const duplicateDialogCheck = (openedDialog) => {
           return openedDialog === this;
        };

        if (this.dialogService.getOpenedDialogs().some(duplicateDialogCheck)) {
            return;
        }

        this.dialogService.addToOpenedDialogs(this);

        // extend the context with the initState
        Object.assign(this.context, initState);
        this.dialogRef = this.bsModal.show(this.getTemplateRef(), this.modalOptions);
    }

    /**
     * closes the dialog
     * invokes the on-close event callback
     */
    public close() {
        // remove the popovers in the page to avoid the overlap with dialog
        // closePopover(this.$element); Commenting this line because it is causing regression(if we have dialog inside popover as partail content, then the dialog close is not working because on closing the popover the partial get destroyed.)
        if (this.dialogRef) {
            this.dialogService.addToClosedDialogs(this);
            this.dialogRef.hide();
        }
    }

    /**
     * Register the dialog with the dialog service for programmatic access
     */
    protected register(scope) {
        // add scope along with name in the dialogRefsCollection Map while registering dialog
        // So that 2 dialogs having same name on different pages won't be overridden.
        this.dialogService.register(this.name, this, scope);
    }

    /**
     * De Register the dialog with the dialog service after dialog destruction
     */
    protected deRegister(scope) {
        this.dialogService.deRegister(this.name, scope);
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

    public ngOnDestroy() {
        this.close();
        this.deRegister(this.viewParent);
        super.ngOnDestroy();
    }
}
