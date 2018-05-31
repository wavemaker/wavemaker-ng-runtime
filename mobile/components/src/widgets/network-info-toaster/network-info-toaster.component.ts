import { ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy } from '@angular/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';

import { registerProps } from './network-info-toaster.props';
import { NetworkService } from '@wm/mobile/core';
import { $appDigest, App } from '@wm/core';

registerProps();

const DEFAULT_CLS = 'network-info-toaster';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS};

enum NetworkState {
    CONNECTED = 1,
    CONNECTING = 0,
    SERVICE_AVAILABLE_BUT_NOT_CONNECTED = -1,
    NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE = -2,
    NETWORK_NOT_AVAIABLE = -3
}


@Component({
    selector: '[wmNetworkInfoToaster]',
    templateUrl: './network-info-toaster.component.html',
    providers: [
        provideAsWidgetRef(NetworkInfoToasterComponent)
    ]
})
export class NetworkInfoToasterComponent extends StylableComponent implements OnDestroy {

    public showMessage = false;
    public isServiceConnected = false;
    public isServiceAvailable = false;
    public networkState: NetworkState;

    private _listenerDestroyer;

    constructor(private networkService: NetworkService, app: App, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this);
        this.isServiceAvailable = <boolean> this.networkService.isAvailable();
        this.isServiceConnected = this.networkService.isConnected();
        this._listenerDestroyer = app.subscribe('onNetworkStateChange', (data) => {
            let autoHide = false;
            this.showMessage = true;
            if (data.isConnected) {
                this.networkState = NetworkState.CONNECTED;
                autoHide = true;
            } else if (data.isConnecting) {
                this.networkState = NetworkState.CONNECTING;
            } else if (data.isServiceAvailable) {
                this.networkState = NetworkState.SERVICE_AVAILABLE_BUT_NOT_CONNECTED;
            } else if (data.isNetworkAvailable && !data.isServiceAvailable) {
                this.networkState = NetworkState.NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE;
            } else {
                this.networkState = NetworkState.NETWORK_NOT_AVAIABLE;
            }
            if (autoHide) {
                setTimeout(() => {
                    this.showMessage = false;
                    $appDigest();
                }, 5000);
            }
        });
    }

    public connect() {
        this.networkService.connect();
    }

    public hideMessage() {
        this.showMessage = false;
    }

    public ngOnDestroy() {
        this._listenerDestroyer();
    }
}
