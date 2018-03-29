import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './login.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { TextDirective } from '../text/text.directive';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ButtonComponent } from '../button/button.component';
import { invokeEventHandler } from '../../utils/widget-utils';

const WIDGET_INFO = {widgetType: 'wm-login', hostClass: 'app-login'};

registerProps();

declare const _, $;

@Component({
    selector: 'div[wmLogin]',
    templateUrl: './login.component.html'
})
export class LoginComponent extends BaseComponent implements AfterViewInit {

    usernameCmp: TextDirective;

    passwordCmp: TextDirective;

    rememberMeCmp: CheckboxComponent;

    loginButtonCmp: ButtonComponent;

    loginDetails: any;

    @ContentChildren(TextDirective, {descendants: true}) textInputComponents;
    @ContentChildren(CheckboxComponent, {descendants: true}) checkboxCmp;
    @ContentChildren(ButtonComponent, {descendants: true}) buttonComponents;

    loginMessage: { type?: string; caption?: any; show?: boolean; };

    errormessage: any;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_INFO, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    initLoginButtonActions() {
        this.loginButtonCmp.$element.addEventListener('click', event => {
            this.loginDetails = {
                username: this.usernameCmp.datavalue,
                password: this.passwordCmp.datavalue,
                rememberme: this.rememberMeCmp.datavalue
            };
            if (!(<HTMLFormElement>this.usernameCmp.$element).checkValidity() || !(<HTMLFormElement>this.passwordCmp.$element).checkValidity()) {
                return;
            }
            if (this.$element.hasAttribute('submit.event') || this.loginButtonCmp.$element.hasAttribute('click.event')) {
                // TODO: Check if it is a variable or any other action event
                invokeEventHandler(this, 'click');
                invokeEventHandler(this, 'submit');
            } else {
                this.parent.Variables.loginAction.login({loginInfo: this.loginDetails}, this.onSuccess, this.onError);
            }
        });
    }

    onSuccess() {
        invokeEventHandler(this, 'success');
    }

    onError(error?) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.parent.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        invokeEventHandler(this, 'error');
    }

    ngAfterViewInit() {
        this.textInputComponents._results.forEach(cmp => {
            let elementType = cmp.$element.getAttribute('name');
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
            if (cmp.$element.getAttribute('name') === 'remembermecheck') {
                this.rememberMeCmp = cmp;
            }
        });

        this.buttonComponents._results.forEach(cmp => {
            if (cmp.$element.getAttribute('name') === 'loginButton' || _.includes(cmp.$element.classList, 'app-login-button')) {
                if (this.loginButtonCmp) {
                    return;
                }
                this.loginButtonCmp = cmp;
                this.initLoginButtonActions();
            }
        });
    }
}
