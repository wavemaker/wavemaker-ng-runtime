import { AfterViewInit, Component, ContentChild, ContentChildren, Injector, QueryList } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './login.props';
import { ButtonComponent } from '../button/button.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { FormComponent } from '../form/form.component';

const WIDGET_INFO = {widgetType: 'wm-login', hostClass: 'app-login'};

registerProps();

declare const _;

@Component({
    selector: 'div[wmLogin]',
    templateUrl: './login.component.html',
    providers: [
        provideAsWidgetRef(LoginComponent)
    ]
})
export class LoginComponent extends StylableComponent implements AfterViewInit {

    loginBtnCmp: ButtonComponent;

    @ContentChild(FormComponent) formCmp: FormComponent;
    @ContentChildren(ButtonComponent, {descendants: true}) buttonComponents: QueryList<ButtonComponent>;

    loginMessage: { type?: string; caption?: any; show?: boolean; };
    errormessage: any;
    eventsource;

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onSuccess() {
        this.invokeEventCallback('success');
    }

    onError(error?) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        this.invokeEventCallback('error');
    }

    getLoginDetails(): any {
        return this.formCmp.dataoutput;
    }

    initLoginButtonActions() {
        this.loginBtnCmp.getNativeElement().addEventListener('click', event => {

            if (this.nativeElement.hasAttribute('submit.event') || this.loginBtnCmp.getNativeElement().hasAttribute('click.event')) {
                // TODO: Check if it is a variable or any other action event
                this.invokeEventCallback('click');
                this.invokeEventCallback('submit');
            } else if (this.eventsource) {
                this.eventsource.invoke({loginInfo: this.getLoginDetails()}, this.onSuccess.bind(this), this.onError.bind(this));
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
