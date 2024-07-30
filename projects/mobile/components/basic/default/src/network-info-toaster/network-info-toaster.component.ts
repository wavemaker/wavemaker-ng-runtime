import {Component, Inject, Injector, OnDestroy, Optional} from '@angular/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './network-info-toaster.props';
import {$appDigest, App} from '@wm/core';
import { NetworkService } from '@wm/mobile/core';

const DEFAULT_CLS = 'network-info-toaster';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS};

export enum NetworkState {
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
    static initializeProps = registerProps();

    public showMessage = false;
    public isServiceConnected = false;
    public isServiceAvailable = false;
    public networkState: NetworkState;

    private _listenerDestroyer;

    constructor(private networkService: NetworkService, app: App, inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.$element, this);
        this.isServiceAvailable = <boolean> this.networkService.isAvailable();
        this.isServiceConnected = this.networkService.isConnected();
        this._listenerDestroyer = app.subscribe('onNetworkStateChange', (data) => {
            this.renderMessage(data);
        });
        this.renderMessage();
    }

    private renderMessage(data?) {
        data = data || this.networkService.getState();
        const oldState = this.networkState;
        let autoHide = false;
        if (data.noServiceRequired) {
            return false;
        }
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
        this.showMessage = (!(oldState === undefined && data.isConnected)  && oldState !== this.networkState);
        if (autoHide && this.showMessage) {
            setTimeout(() => {
                this.showMessage = false;
                $appDigest();
            }, 5000);
        }
    }

    public connect() {
        this.networkService.connect();
    }

    public hideMessage() {
        this.showMessage = false;
    }

    public ngOnDestroy() {
        this._listenerDestroyer();
        super.ngOnDestroy();
    }
}
