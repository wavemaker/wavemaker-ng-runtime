import { ApplicationRef, Component, DoCheck, ElementRef, NgZone, ViewEncapsulation } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

import { setTheme } from 'ngx-bootstrap';

import { $invokeWatchers, AbstractDialogService, AbstractSpinnerService, getWmProjectProperties, hasCordova, setAppRef, setNgZone, setPipeProvider } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { PipeProvider } from '../../services/pipe-provider.service';

interface SPINNER {
    show: boolean;
    messages: Array<string>;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements DoCheck {
    private startApp = false;
    public isApplicationType = false;

    spinner: SPINNER = {show: false, messages: []};
    constructor(
        _pipeProvider: PipeProvider,
        _appRef: ApplicationRef,
        private elRef: ElementRef,
        private oAuthService: OAuthService,
        private dialogService: AbstractDialogService,
        private spinnerService: AbstractSpinnerService,
        ngZone: NgZone,
        private router: Router
    ) {
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);

        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';

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
        if (hasCordova() && !window['wmDeviceReady']) {
            document.addEventListener('wmDeviceReady' , () => this.startApp = true);
        } else {
            this.startApp = true;
        }

        let spinnerId;

        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                spinnerId = this.spinnerService.show('', 'globalSpinner');
            } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(() => this.spinnerService.hide(spinnerId), 1000);
            }
        });
    }

    providersConfig;
    isOAuthDialogOpen = false;

    showOAuthDialog() {
        if (!this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = true;
            this.dialogService.open('oAuthLoginDialog');
        }
    }

    closeOAuthDialog() {
        if (this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = false;
            this.dialogService.close('oAuthLoginDialog');
        }
    }

    ngDoCheck() {
        $invokeWatchers();
    }

    // dummy implementation
    registerFragment() {}
    resolveFragment() {}
}
