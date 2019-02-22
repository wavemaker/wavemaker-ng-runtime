import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Network } from '@ionic-native/network';

import { App, getAbortableDefer, noop, retryIfFails } from '@wm/core';

import { IDeviceStartUpService } from './device-start-up-service';

declare const _, cordova, Connection, navigator;

const AUTO_CONNECT_KEY = 'WM.NetworkService._autoConnect',
    IS_CONNECTED_KEY = 'WM.NetworkService.isConnected',
    excludedList = [new RegExp('/wmProperties.js')],
    originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open,
    originalXMLHttpRequestSend = XMLHttpRequest.prototype.send,
    networkState = {
        isConnecting : false,
        isConnected : localStorage.getItem(IS_CONNECTED_KEY) === 'true',
        isNetworkAvailable : true,
        isServiceAvailable : true
    };

/**
 * If server is not connected and url does not match the unblock list of regular expressions,
 * then this function return true. Otherwise, return false.
 * @param url
 * @returns {boolean}
 */
const blockUrl = url => {
    let block = !networkState.isConnected && _.startsWith(url, 'http');
    if (block) {
        block = !_.find(excludedList, regExp => regExp.test(url));
    }
    return block;
};

// Intercept all XHR calls
XMLHttpRequest.prototype.open = function (method: string, url: string, async: boolean = true, user?: string, password?: string) {
    if (blockUrl(url)) {
        const urlSplits = url.split('://');
        const pathIndex = urlSplits[1].indexOf('/');
        urlSplits[1] = 'localhost' + (pathIndex > 0 ? urlSplits[1].substr(pathIndex) : '/');
        url = urlSplits.join('://');
    }
    return originalXMLHttpRequestOpen.apply(this, [method, url, async, user, password]);
};

@Injectable()
export class NetworkService implements IDeviceStartUpService {

    public serviceName = NetworkService.name;

    private _autoConnect = localStorage.getItem(AUTO_CONNECT_KEY) !== 'false';
    private _lastKnownNetworkState: any;

    constructor(private httpClient: HttpClient, private app: App, private network: Network) {

    }

    /**
     * This method attempts to connect app to the server and returns a promise that will be resolved with
     * a boolean value based on the operation result.
     *
     * @returns {object} promise
     */
    public connect(): Promise<boolean> {
        this.setAutoConnect(true);
        return this.tryToConnect();
    }

    /**
     * When the auto connect is enabled, then app is automatically connected  whenever server is available.
     * Every time when app goes offline, auto connect is enabled. Before app coming to online, one can disable
     * the auto connection flow using this method.
     */
    public disableAutoConnect = () => this.setAutoConnect(false);

    /**
     * This method disconnects the app from the server and returns a promise that will be resolved with
     * a boolean value based on the operation result. Use connect method to reconnect.
     *
     * @returns {object} promise
     */
    public disconnect(): Promise<boolean> {
        const p = this.tryToDisconnect();
        this.disableAutoConnect();
        return p;
    }

    /**
     * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
     * check.If pingServer is false, returns a boolean value based on the last known service availability.
     *
     * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
     */
    public isAvailable(pingServer = false): boolean | Promise<boolean> {
        if (pingServer) {
            return this.isServiceAvailable().then(() => {
                this.checkForNetworkStateChange();
                return networkState.isServiceAvailable;
            });
        }
        return networkState.isServiceAvailable;
    }

    /**
     * Returns true, if app is connected to server. Otherwise, returns false.
     *
     * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
     */
    public isConnected = () => networkState.isConnected;

    /**
     * Returns true if app is trying to connect to server. Otherwise, returns false.
     *
     * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
     */
    public isConnecting = () => networkState.isConnecting;

    /**
     * This method returns a promise that is resolved when connection is established with server.
     *
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    public onConnect() {
        let defer,
            cancelSubscription;
        if (this.isConnected()) {
            return Promise.resolve();
        }
        defer = getAbortableDefer();
        cancelSubscription = this.app.subscribe('onNetworkStateChange', () => {
            if (this.isConnected()) {
                defer.resolve(true);
                cancelSubscription();
            }
        });
        defer.promise.catch(function () {
            cancelSubscription();
        });
        return defer.promise;
    }

    /**
     * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
     * be invoked when network is back. The returned can also be aborted.
     *
     * @param {function()} fn method to invoke.
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    public retryIfNetworkFails(fn) {
        const defer = getAbortableDefer();
        retryIfFails(fn, 0, 0, () => {
            let onConnectPromise;
            if (!this.isConnected()) {
                onConnectPromise = this.onConnect();
                defer.promise.catch(function () {
                    onConnectPromise.abort();
                });
                return onConnectPromise;
            }
            return false;
        }).then(defer.resolve, defer.reject);
        return defer.promise;
    }

    public start(): Promise<void> {
        if (cordova) {
            this.tryToConnect(true).catch(noop);
            // Connection constant will be available only when network plugin is included.
            if (window['Connection'] && navigator.connection) {
                networkState.isNetworkAvailable = (navigator.connection.type !== Connection.NONE);
                /*
                 * When the device comes online, check is the service is available. If the service is available and auto
                 * connect flag is true, then app is automatically connected to remote server.
                 */
                this.network.onConnect().subscribe(() => {
                    networkState.isNetworkAvailable = true;
                    this.tryToConnect().catch(noop);
                });

                /*
                 *When device goes offline, then change the network state and emit that notifies about network state change.
                 */
                this.network.onDisconnect().subscribe(() => {
                    networkState.isNetworkAvailable = false;
                    networkState.isServiceAvailable = false;
                    this.tryToDisconnect();
                });

                this.app.subscribe('onNetworkStateChange', (data) => {
                    /**
                     * If network is available and server is not available,then
                     * try to connect when server is available.
                     */
                    if (data.isNetworkAvailable && !data.isServiceAvailable) {
                        this.checkForServiceAvailiblity().then(() => this.connect());
                    }
                });
            }
        }
        return Promise.resolve();
    }

    /**
     * This function adds the given regular expression to the unblockList. Even app is in offline mode,
     * the urls matching with the given regular expression are not blocked by NetworkService.
     *
     * @param {string} urlRegex regular expression
     */
    public unblock(urlRegex: string) {
        excludedList.push(new RegExp(urlRegex));
    }

    private checkForNetworkStateChange() {
        if (!_.isEqual(this._lastKnownNetworkState, networkState)) {
            this._lastKnownNetworkState = _.clone(networkState);
            this.app.notify('onNetworkStateChange', this._lastKnownNetworkState);
        }
    }

    /**
     * Returns a promise that is resolved when server is available.
     * @returns {*}
     */
    private checkForServiceAvailiblity(): Promise<void> {
        return new Promise<void>(resolve => {
            const intervalId = setInterval(() => {
                this.isServiceAvailable().then(available => {
                    if (available) {
                        clearInterval(intervalId);
                        resolve();
                    }
                });
            }, 5000);
        });
    }

    /**
     * Pings server to check whether server is available. Based on ping response network state is modified.
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    private isServiceAvailable(): Promise<boolean> {
        return this.pingServer().then(response => {
            networkState.isServiceAvailable = response;
            if (!networkState.isServiceAvailable) {
                networkState.isConnecting = false;
                networkState.isConnected = false;
            }
            return response;
        });
    }

    /**
     * Pings server
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    private pingServer(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const oReq = new XMLHttpRequest();
            let baseURL = this.app.deployedUrl;
            if (baseURL && !_.endsWith(baseURL, '/')) {
                baseURL += '/';
            } else {
                baseURL = baseURL || '';
            }
            oReq.addEventListener('load', () => {
                if (oReq.status === 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
            oReq.addEventListener('error', () => resolve(false));
            oReq.open('GET', baseURL + 'services/application/wmProperties.js?t=' + Date.now());
            oReq.send();
        });
    }

    private setAutoConnect(flag: boolean): void {
        this._autoConnect = flag;
        localStorage.setItem(AUTO_CONNECT_KEY, '' + flag);
    }

    /**
     * Tries to connect to remote server. Network State will be changed based on the success of connection
     * operation and emits an event notifying the network state change.
     *
     * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
     * events are emitted for network status change.
     * @returns {*} a promise
     */
    private tryToConnect(silentMode = false): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.isServiceAvailable().then(() => {
                if (networkState.isServiceAvailable && this._autoConnect) {
                    networkState.isConnecting = true;
                    if (!silentMode) {
                        this.checkForNetworkStateChange();
                    }
                    setTimeout(() => {
                        networkState.isConnecting = false;
                        networkState.isConnected = true;
                        localStorage.setItem(IS_CONNECTED_KEY, '' + true);
                        if (!silentMode) {
                            this.checkForNetworkStateChange();
                        }
                        resolve(true);
                    }, silentMode ? 0 : 5000);
                } else {
                    networkState.isConnecting = false;
                    networkState.isConnected = false;
                    localStorage.setItem(IS_CONNECTED_KEY, '' + false);
                    reject();
                    this.checkForNetworkStateChange();
                }
            });
        });
    }

    private tryToDisconnect(): Promise<boolean> {
        networkState.isConnected = false;
        networkState.isConnecting = false;
        this.checkForNetworkStateChange();
        localStorage.setItem(IS_CONNECTED_KEY, '' + networkState.isConnected);
        return Promise.resolve(networkState.isConnected);
    }
}
