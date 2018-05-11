import { AfterViewInit, Component, ContentChildren, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './login.props';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ButtonComponent } from '../button/button.component';
import { InputTextComponent } from '../text/text/input-text.component';

const WIDGET_INFO = {widgetType: 'wm-login', hostClass: 'app-login'};

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmLogin]',
    templateUrl: './login.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => LoginComponent)}
    ]
})
export class LoginComponent extends StylableComponent implements AfterViewInit {

    usernameCmp: InputTextComponent;

    passwordCmp: InputTextComponent;

    rememberMeCmp: CheckboxComponent;

    loginButtonCmp: ButtonComponent;

    loginDetails: any;

    @ContentChildren(InputTextComponent, {descendants: true}) textInputComponents;
    @ContentChildren(CheckboxComponent, {descendants: true}) checkboxCmp;
    @ContentChildren(ButtonComponent, {descendants: true}) buttonComponents;

    loginMessage: { type?: string; caption?: any; show?: boolean; };

    errormessage: any;

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    initLoginButtonActions() {
        this.loginButtonCmp.getNativeElement().addEventListener('click', event => {
            this.loginDetails = {
                username: this.usernameCmp.datavalue,
                password: this.passwordCmp.datavalue,
                rememberme: this.rememberMeCmp.datavalue
            };
            if (!(<HTMLFormElement>this.usernameCmp.getNativeElement()).checkValidity() || !(<HTMLFormElement>this.passwordCmp.getNativeElement()).checkValidity()) {
                return;
            }
            if (this.nativeElement.hasAttribute('submit.event') || this.loginButtonCmp.getNativeElement().hasAttribute('click.event')) {
                // TODO: Check if it is a variable or any other action event
                this.invokeEventCallback('click');
                this.invokeEventCallback('submit');
            } else {
                this.pageComponent.Variables.loginAction.login({loginInfo: this.loginDetails}, this.onSuccess, this.onError);
            }
        });
    }

    onSuccess() {
        this.invokeEventCallback('success');
    }

    onError(error?) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.pageComponent.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        this.invokeEventCallback('error');
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.textInputComponents._results.forEach(cmp => {
            const elementType = cmp.getNativeElement().getAttribute('name');
            switch (elementType) {
                case 'usernametext':
                    this.usernameCmp = cmp;
                    break;
                case 'passwordtext':
                    this.passwordCmp = cmp;
                    break;
            }
        });

        this.checkboxCmp._results.forEach(cmp => {
            if (cmp.getNativeElement().getAttribute('name') === 'remembermecheck') {
                this.rememberMeCmp = cmp;
            }
        });

        this.buttonComponents._results.forEach(cmp => {
            if (cmp.getNativeElement().getAttribute('name') === 'loginButton' || _.includes(cmp.getNativeElement().classList, 'app-login-button')) {
                if (this.loginButtonCmp) {
                    return;
                }
                this.loginButtonCmp = cmp;
                this.initLoginButtonActions();
            }
        });
    }
}
