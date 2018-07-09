import { AfterViewInit, ApplicationRef, Component, DoCheck, ElementRef, NgZone } from '@angular/core';

import { $invokeWatchers, _WM_APP_PROJECT, AbstractDialogService, hasCordova, setAppRef, setNgZone, setPipeProvider } from '@wm/core';

import { OAuthService } from '@wm/oAuth';
import { AbstractSpinnerService } from '@wm/core';

import { PipeProvider } from './services/pipe-provider.service';
import { setTheme } from 'ngx-bootstrap';

type SPINNER = {show: boolean, messages: Array<string>};

@Component({
    selector: 'app-root',
    template: `
        <router-outlet></router-outlet>
        <app-common-page hidden></app-common-page>
        <app-spinner [show]="spinner.show" [spinnermessages]="spinner.messages"></app-spinner>
        <div wmDialog name="oAuthLoginDialog" title.bind="'Application is requesting you to sign in with'" close.event="closeOAuthDialog()">
            <ng-template #dialogBody>
                <ul class="list-items">
                    <li class="list-item" *ngFor="let provider of providersConfig">
                        <button class="btn" (click)="provider.invoke()">{{provider.name}}</button>
                    </li>
                </ul>
            </ng-template>
        </div>
        <div wmConfirmDialog name="_app-confirm-dialog" title.bind="title" message.bind="message" oktext.bind="oktext" canceltext.bind="canceltext"
                iconclass.bind="iconclass" ok.event="onOk()" cancel.event="onCancel()" close.event="onClose()"></div>
        <div wmAppExt></div>
        <i id="wm-mobile-display"></i>`
})
export class AppComponent implements DoCheck {
    spinner: SPINNER = {show: false, messages: []};
    constructor(
        _pipeProvider: PipeProvider,
        _appRef: ApplicationRef,
        private elRef: ElementRef,
        private oAuthService: OAuthService,
        private dialogService: AbstractDialogService,
        private spinnerService: AbstractSpinnerService,
        ngZone: NgZone
    ) {
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        // subscribe to OAuth changes
        oAuthService.getOAuthProvidersAsObservable().subscribe((providers: any) => {
            this.providersConfig = providers;
            if (providers.length) {
                this.showOAuthDialog();
            } else {
                this.closeOAuthDialog();
            }
        });

        // Subscribe to the message source to show/hide app spinner
        this.spinnerService.getMessageSource().asObservable().subscribe((data: any) => {
            // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
            setTimeout(() => {
                this.spinner.show = data.show;
                this.spinner.messages = data.messages;
            });
        });

        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');
    }

    providersConfig;

    showOAuthDialog() {
        this.dialogService.open('oAuthLoginDialog');
    }

    closeOAuthDialog() {
        this.dialogService.close('oAuthLoginDialog');
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
