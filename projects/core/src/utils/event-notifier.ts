import { Subject } from 'rxjs';

import { isObject, noop } from './utils';

export class EventNotifier {

    private _subject = new Subject();
    private _isInitialized = false;
    private _eventsBeforeInit = [];

    constructor(start = true) {
        if (start) {
            this.start();
        }
    }

    /**
     * A event can be fired, but will be sent to subscribers only after exchange is started.
     *
     * @param {string} eventName
     * @param data
     */
    public notify(eventName: string, ...data: Array<any>) {
        if (this._isInitialized) {
            this._subject.next({
                name: eventName,
                data: data
            });
        } else {
            this._eventsBeforeInit.push({
                name: eventName,
                data: data
            });
        }
    }

    /**
     * starts the exchange and send the pending events to subscribers.
     */
    public start() {
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._eventsBeforeInit.forEach((event) => this._subject.next(event));
        }
    }

    /**
     * upon subscription, method to cancel subscription is returned.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {() => void}
     */
    public subscribe(eventName, callback: (...data: Array<any>) => void): () => void {
        let eventListener;
        if (eventName && callback) {
            eventListener = this._subject
                .subscribe((event: any) => {
                    if (event && isObject(event) && event.name === eventName) {
                        callback.apply(undefined, event.data);
                    }
                });
            return () => {
                eventListener.unsubscribe();
            };
        }
        return noop;
    }

    public destroy(): void {
        this._subject.complete();
    }
}
