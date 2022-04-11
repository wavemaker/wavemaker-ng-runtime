import { Injector, OnDestroy, TemplateRef, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { Subscription } from 'rxjs';

import { AbstractDialogService, closePopover, findRootContainer } from '@wm/core';

import { BaseComponent, IDialog, IWidgetConfig } from '@wm/components/base';

let eventsRegistered = false;

const invokeOpenedCallback = (ref) => {
    if (ref) {
        setTimeout(() => {
            const root = findRootContainer(ref.$element);
            // if page styles have to be applied to dialog then dialog has to be child of page element.
            if (root) {
                $('body > modal-container > div').wrap('<' + root + '/>');
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

@Injectable()
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
        const router = inj.get(Router);

        const subscriptions: Subscription[] = [
            this.bsModal.onShown.subscribe(() => {
                const ref = this.dialogService.getLastOpenedDialog();
                if (ref === this) {
                    // Always get the reference of last pushed dialog in the array for calling onOpen callback
                    invokeOpenedCallback(ref);
                }
            }),
            this.bsModal.onHidden.subscribe((closeReason) => {
                const ref = closeReason === 'esc' || closeReason === 'backdrop-click' ? this.dialogService.getLastOpenedDialog() : this.dialogService.getDialogRefFromClosedDialogs();
                if (ref === this) {
                    // remove the dialog reference from opened dialogs and closed dialogs
                    this.dialogService.removeFromOpenedDialogs(ref);
                    this.dialogService.removeFromClosedDialogs(ref);
                    invokeClosedCallback(ref);
                    if (ref.closeCallBackFn) {
                        ref.closeCallBackFn();
                    }
                }
            }),
            router.events.subscribe(e => {
                if (e instanceof NavigationEnd) {
                    this.close();
                }
            })
        ];
        this.registerDestroyListener(() => {// remove the dialog reference from opened dialogs and closed dialogs
            this.dialogService.removeFromOpenedDialogs(this);
            this.dialogService.removeFromClosedDialogs(this);
            subscriptions.forEach(s => s.unsubscribe());
        });
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
            this.modalOptions.class = this.modalOptions.class.replace(' animated ' + ov, '');
            if (nv) {
                this.modalOptions.class = this.modalOptions.class + ' animated ' + nv;
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
