import { AfterViewInit, ApplicationRef, Component, DoCheck, ElementRef } from '@angular/core';

import { $invokeWatchers, _WM_APP_PROJECT, setAppRef, setPipeProvider } from '@wm/core';
import { DialogService } from '@wm/components';
import { OAuthService } from '@wm/oAuth';

import { PipeProvider } from './services/pipe-provider.service';

@Component({
    selector: 'div#wm-app-content',
    template: `<router-outlet></router-outlet>
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
    <div wmNetworkInfoToaster></div>`
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
        const networkInfoEle = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster]'),
            target = $('body >[wmNetworkInfoToaster]');
        if (target.length > 0) {
            networkInfoEle.insertAfter(target);
            target.remove();
        } else {
            networkInfoEle.remove();
        }
    }
}
