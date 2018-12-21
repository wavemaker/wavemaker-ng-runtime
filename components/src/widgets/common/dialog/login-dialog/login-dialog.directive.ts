import { ContentChild, ContentChildren, Directive, Inject, QueryList, Self } from '@angular/core';

import { Context, DialogRef } from '../../../framework/types';
import { FormComponent } from '../../form/form.component';
import { MessageComponent } from '../../message/message.component';

@Directive({
    selector: '[wmDialog][wmLoginDialog]'
})
export class LoginDialogDirective {
    @ContentChildren(FormComponent) formCmp: QueryList<FormComponent>;
    @ContentChild(MessageComponent) msgCmp: MessageComponent;

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
        if (ds) {
            this.showLoading();
            ds.invoke({loginInfo: loginInfo}, this.onSuccess.bind(this), this.onError.bind(this));
        }
    }
}
