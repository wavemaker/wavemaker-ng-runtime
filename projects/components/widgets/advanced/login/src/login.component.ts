import { AfterViewInit, Component, ContentChild, ContentChildren, Injector, QueryList, ViewChild } from '@angular/core';

import { APPLY_STYLES_TYPE, MessageComponent, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { FormComponent } from '@wm/components/data/form';
import { ButtonComponent } from '@wm/components/input';

import { registerProps } from './login.props';

const WIDGET_INFO = {widgetType: 'wm-login', hostClass: 'app-login'};

declare const _;

@Component({
    selector: 'div[wmLogin]',
    templateUrl: './login.component.html',
    providers: [
        provideAsWidgetRef(LoginComponent)
    ]
})
export class LoginComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();
    loginBtnCmp: ButtonComponent;

    @ContentChild(FormComponent) formCmp: FormComponent;
    @ContentChildren(ButtonComponent, {descendants: true}) buttonComponents: QueryList<ButtonComponent>;
    @ViewChild(MessageComponent, { static: true }) messageCmp: MessageComponent;

    loginMessage: { type?: string; caption?: any; show?: boolean; };
    errormessage: any;
    eventsource;

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onSuccessCB() {
        this.invokeEventCallback('success');
    }

    onErrorCB(error?) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        this.messageCmp.showMessage(this.loginMessage.caption, this.loginMessage.type);
        this.invokeEventCallback('error');
    }

    getLoginDetails(): any {
        return this.formCmp.dataoutput;
    }

    doLogin() {
        if (this.eventsource) {
            this.formCmp.ngform.valid && this.eventsource.invoke({loginInfo: this.getLoginDetails()}, this.onSuccessCB.bind(this), this.onErrorCB.bind(this));
        } else {
            console.warn('Default action "loginAction" does not exist. Either create the Action or assign an event to onSubmit of the login widget');
        }
    }

    initLoginButtonActions() {
        this.loginBtnCmp.getNativeElement().addEventListener('click', event => {

            // if no event is attached to the onSubmit of login widget or loginButton inside it, invoke default login action
            if (!this.nativeElement.hasAttribute('submit.event') && !this.loginBtnCmp.getNativeElement().hasAttribute('click.event') && !this.loginBtnCmp.getNativeElement().hasAttribute('tap.event')) {
                this.doLogin();
            }
        });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        // suppresses the default form submission (in browsers like Firefox)
        this.formCmp.getNativeElement().addEventListener('submit', e => e.preventDefault());

        // get login button component
        this.buttonComponents.forEach(cmp => {
            if (cmp.getNativeElement().getAttribute('name') === 'loginButton' || _.includes(cmp.getNativeElement().classList, 'app-login-button')) {
                if (this.loginBtnCmp) {
                    return;
                }
                this.loginBtnCmp = cmp;
                this.initLoginButtonActions();
            }
        });
    }
}
