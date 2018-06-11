import { AfterViewInit, ApplicationRef, Component, DoCheck, ElementRef } from '@angular/core';

import { $invokeWatchers, _WM_APP_PROJECT, hasCordova, setAppRef, setPipeProvider } from '@wm/core';
import { DialogService } from '@wm/components';
import { OAuthService } from '@wm/oAuth';

import { PipeProvider } from './services/pipe-provider.service';

@Component({
    selector: 'app-root',
    template: `
        <router-outlet></router-outlet>
        <app-common-page></app-common-page>
        <!--<wm-spinner name="globalspinner" classname="global-spinner" caption=""></wm-spinner>-->
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
        <div wmAppUpdate></div>`
})
export class AppComponent implements DoCheck, AfterViewInit {
    constructor(_pipeProvider: PipeProvider, _appRef: ApplicationRef, private elRef: ElementRef, private oAuthService: OAuthService, private dialogService: DialogService) {
        setPipeProvider(_pipeProvider);
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
