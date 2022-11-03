import { AfterViewInit, ContentChild, ContentChildren, Directive, Inject, OnDestroy, QueryList, Self } from '@angular/core';

import { $appDigest } from '@wm/core';
import { Context, DialogRef, MessageComponent } from '@wm/components/base';
import { FormComponent } from '@wm/components/data/form';
import {createFocusTrap} from 'focus-trap';

let focusTrapObj;

@Directive({
    selector: '[wmDialog][wmLoginDialog]'
})
export class LoginDialogDirective implements AfterViewInit, OnDestroy {
    @ContentChildren(FormComponent) formCmp: QueryList<FormComponent>;
    @ContentChild(MessageComponent) msgCmp: MessageComponent;
    dialogOpenSubscription;
    dialogCloseSubscription;
    constructor(@Self() @Inject(Context) private contexts: Array<any>,
                @Self() private dialogRef: DialogRef<any>) {
        this.contexts[0].doLogin = () => this.doLogin();
    }

    hideMsg() {
        if (this.msgCmp) {
            this.msgCmp.hideMessage();
        }
    }

    showError(msg) {
        if (this.msgCmp) {
            this.msgCmp.showMessage(msg, 'error');
        }
    }

    showLoading() {
        if (this.msgCmp) {
            this.msgCmp.showMessage('Loading...', 'loading');
        }
    }

    onSuccess() {
        this.hideMsg();
    }

    onError(error?) {
        this.showError(error);
    }

    getLoginDetails() {
        return this.formCmp.first.dataoutput;
    }

    doLogin() {
        const loginInfo = this.getLoginDetails();
        const ds = (this.dialogRef as any).eventsource;
        if (ds && loginInfo['j_username'] && loginInfo['j_password']) {
            this.showLoading();
            ds.invoke({loginInfo: loginInfo}, this.onSuccess.bind(this), this.onError.bind(this));
        }
    }

    ngAfterViewInit() {
        // On login dialog open we wait till the form loads and then assign the enter
        // key event to the textbox in form.
        this.dialogOpenSubscription = this.dialogRef.bsModal.onShown.subscribe(() => {
            setTimeout(() => {
                //  Will activate focus trap for all the dialogs when they are opened.
                const container = document.getElementsByClassName('modal-dialog')[0] as any;
                focusTrapObj = createFocusTrap(container, {
                    onActivate: () => container.classList.add('is-active'),
                    onDeactivate: () => container.classList.remove('is-active'),
                });
                focusTrapObj.activate();

                // On enter key press submit the login form in Login Dialog
                (this as any).dialogRef.$element.find('.app-textbox').keypress((evt) => {
                    if (evt.which === 13) {
                        evt.stopPropagation();
                        /**
                         * As this function is getting executed outside of angular context,
                         * trigger a digest cycle and then trigger doLogin method, So that the bindings in the loginVariable will be evaluated property
                         */
                        $appDigest();
                        this.doLogin();
                    }
                });
            });
        });

        // 
        this.dialogCloseSubscription = this.dialogRef.bsModal.onHidden.subscribe(() => {
            setTimeout(() => {
                //  Will de-activate focus trap for all the dialogs when they are opened.
                if (focusTrapObj !== undefined) {
                    focusTrapObj.deactivate();
                }
            })
        })
    }

    ngOnDestroy() {
        this.dialogOpenSubscription.unsubscribe();
        this.dialogCloseSubscription.unsubscribe();
    }
}
