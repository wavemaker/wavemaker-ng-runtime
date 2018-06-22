import { AfterViewInit, ApplicationRef, Component, DoCheck, ElementRef, NgZone } from '@angular/core';

import { $invokeWatchers, _WM_APP_PROJECT, DialogService, hasCordova, setAppRef, setNgZone, setPipeProvider } from '@wm/core';

import { OAuthService } from '@wm/oAuth';

import { PipeProvider } from './services/pipe-provider.service';
import { SpinnerService } from './services/spinner.service';

type SPINNER = {show: boolean, messages: Array<string>};

@Component({
    selector: 'app-root',
    template: `
        <router-outlet></router-outlet>
        <app-common-page hidden></app-common-page>
        <app-spinner [show]="spinner.show" [spinnermessages]="spinner.messages"></app-spinner>
        <div wmDialog name="oAuthLoginDialog" title.bind="'Application is requesting you to sign in with'">
            <ul style="list-style: none" class="list-items">
                <li style="padding-bottom: 10px;" class="list-item" *ngFor="let provider of providersConfig">
                    <button class="btn" (click)="provider.invoke()">{{provider.name}}</button>
                </li>
            </ul>
            <div wmDialogActions name="dialogactions1">
                <button wmButton class="btn-primary" caption="Close" click.event="closeDialog()" name="button4"></button>
            </div>
        </div>
        <div wmConfirmDialog name="_app-confirm-dialog" title.bind="title" message.bind="message" oktext.bind="oktext" canceltext.bind="canceltext"
                iconclass.bind="iconclass" ok.event="onOk()" cancel.event="onCancel()" close.event="onClose()"></div>
        <div wmNetworkInfoToaster></div>
        <div wmAppUpdate></div>
        <i id="wm-mobile-display"></i>`
})
export class AppComponent implements DoCheck, AfterViewInit {
    spinner: SPINNER = {show: false, messages: []};
    constructor(
        _pipeProvider: PipeProvider,
        _appRef: ApplicationRef,
        private elRef: ElementRef,
        private oAuthService: OAuthService,
        private dialogService: DialogService,
        private spinnerService: SpinnerService,
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

    ngAfterViewInit() {
        const $eleRef = $(this.elRef.nativeElement);
        const $networkInfo = $eleRef.find('>[wmNetworkInfoToaster]');
        const $appUpdate = $eleRef.find('>[wmAppUpdate]');
        const $target = $('body >wm-network-info-toaster');
        if (hasCordova()) {
            $appUpdate.appendTo('body:first');
            if ($target.length > 0) {
                $networkInfo.insertAfter($target as any);
                $target.remove();
            }
        } else {
            $networkInfo.remove();
            $appUpdate.remove();
            $target.remove();
        }
    }
}
