import {Inject, Injectable, Injector, OnDestroy, Optional, TemplateRef} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-bootstrap/modal';

import {Subscription} from 'rxjs';

import {AbstractDialogService, findRootContainer, generateGUId, isMobile} from '@wm/core';

import {BaseComponent, IDialog, IWidgetConfig, WidgetConfig} from '@wm/components/base';

const eventsRegistered = false;

const invokeOpenedCallback = (ref) => {
    if (ref) {
        setTimeout(() => {
            const root = findRootContainer(ref.$element);
            // if page styles have to be applied to dialog then dialog has to be child of page element.
            if (root) {
                $('body > modal-container > div').wrap('<' + root + '/>');
            }
            const ngContentAttr = Array.from(ref?.$attrs as IterableIterator<[any, any]>).filter(([name]) => String(name).startsWith('_ngcontent-'));
            if (ngContentAttr.length > 0) {
                $('[aria-labelledby=' + ref?.titleId + '] *').attr(String(ngContentAttr[0][0]), '');
            }
            ref.invokeEventCallback('opened', { $event: { type: 'opened' } });
            // Focusing the first focusable element when the dialog is opened
            const container = $('[aria-labelledby= ' + ref.titleId + ']')[0];
            const keyboardFocusableElements = [container.querySelectorAll(
                'a, button, input, textarea, select, details, iframe, embed, object, summary dialog, audio[controls], video[controls], [contenteditable], [tabindex]:not([tabindex="-1"])'
            )].filter(el => {
                return (
                    !el[0].hasAttribute('disabled') && !el[0].hasAttribute('hidden'));
            })[0];
            $(keyboardFocusableElements[0]).focus();

            const openedDialogs = ref.dialogService.getOpenedDialogs();
            if (openedDialogs.length > 1) {
                let zIndex = Number($("[aria-labelledby= " + openedDialogs[openedDialogs.length - 2].titleId + "]").css('z-index'));
                $('[aria-labelledby= ' + ref.dialogService.getLastOpenedDialog().titleId + ']').css('z-index', zIndex + 2);
                $('bs-modal-backdrop').css('z-index', zIndex + 1);
            }
        });
    }
};

const invokeClosedCallback = (ref) => {
    if (ref) {
        ref.invokeEventCallback('close');
        ref.dialogRef = undefined;
        const openedDialogs = ref.dialogService.getOpenedDialogs();
        if (openedDialogs.length >= 1) {
            let zIndex: any = Number($("[aria-labelledby= " + openedDialogs[openedDialogs.length - 1].titleId + "]").css('z-index'));
            $('bs-modal-backdrop').css('z-index', zIndex - 1);
        }
    }
};

@Injectable()
export abstract class BaseDialog extends BaseComponent implements IDialog, OnDestroy {

    public name: string;

    private readonly dialogService: AbstractDialogService;
    private readonly bsModal: BsModalService;

    private dialogRef: BsModalRef;
    private dialogId: number;
    public titleId: string = 'wmdialog-' + generateGUId();
    public sheet: string | boolean;
    public sheetPosition: string;
    private dialogOriginFocusStack: HTMLElement[] = [];

    protected constructor(
        inj: Injector,
        @Inject(WidgetConfig) config: IWidgetConfig,
        protected modalOptions: ModalOptions,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, config, explicitContext);
        this.dialogService = inj.get(AbstractDialogService);
        this.bsModal = inj.get(BsModalService);
        const router = inj.get(Router);

        const subscriptions: Subscription[] = [
            this.bsModal.onShown.subscribe(({ id }) => {
                const ref = this.dialogService.getLastOpenedDialog();
                if (ref === this && !this.dialogId) {
                    // Always get the reference of last pushed dialog in the array for calling onOpen callback
                    invokeOpenedCallback(ref);
                    this.dialogId = id;
                }
            }),
            this.bsModal.onShow.subscribe(() => {}),
            this.bsModal.onHidden.subscribe((closeReason) => {
                let ref = this.dialogService.getDialogRefFromClosedDialogs();
                if (this.dialogId && closeReason?.id === this.dialogId) {
                    ref = this;
                } else if (closeReason === 'esc' || closeReason === 'backdrop-click') {
                    ref = this.dialogService.getLastOpenedDialog();
                }
                if (ref === this) {
                    this.dialogId = null;
                    // remove the dialog reference from opened dialogs and closed dialogs
                    this.dialogService.removeFromOpenedDialogs(ref);
                    this.dialogService.removeFromClosedDialogs(ref);
                    invokeClosedCallback(ref);
                    if (ref.closeCallBackFn) {
                        ref.closeCallBackFn();
                    }
                }
            }),
            this.bsModal.onHide.subscribe(() => {}),
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
        this.modalOptions.ariaLabelledBy = this.titleId;
        this.dialogOriginFocusStack.push(document.activeElement as HTMLElement);
        this.dialogRef = this.bsModal.show(this.getTemplateRef(), this.modalOptions);
        // Fix for [WMS-23948]: Focus moving out of active Dialog widget
        if (this.dialogService.getOpenedDialogs().length === 1 && (isMobile())) {
            const parentSelector = $('body > app-root')[0];
            parentSelector.setAttribute('aria-hidden', 'true');
        }
        $('.cdk-focus-trap-anchor').removeAttr('aria-hidden');
    }

    /**
     * closes the dialog
     * invokes the on-close event callback
     */
    public close() {
        // remove the popovers in the page to avoid the overlap with dialog
        // closePopover(this.$element); Commenting this line because it is causing regression(if we have dialog inside popover as partail content, then the dialog close is not working because on closing the popover the partial get destroyed.)
        if (this.dialogRef) {
            const lastDialogOrigin = this.dialogOriginFocusStack.pop();
            this.dialogService.addToClosedDialogs(this);
            this.dialogRef.hide();
            // Return focus to the originating element upon dialog closure
            lastDialogOrigin?.focus();
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
