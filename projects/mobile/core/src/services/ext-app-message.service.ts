import { Injectable } from '@angular/core';

import { App } from '@wm/core';

declare const _;

interface Message {
    address: string;
    data: Map<string, string>;
}

interface Handler {
    pattern: string;
    callback: (msg: string) => any;
}

@Injectable({ providedIn: 'root' })
export class ExtAppMessageService {

    private handlers = [];

    constructor(private app: App) {
        document.addEventListener('externalAppMessageReceived', e => {
            const message = (e['detail'].message) as Message;
            this.handlers.forEach(handler => {
                const matches = handler && message.address.match(handler.pattern);
                if (matches && matches.length > 0) {
                    handler.callBack(message);
                }
            });
        });
    }

    /**
     * adds a listener for a message whose address matches with the given regex pattern.
     *
     * @param {string} messageAddressPattern a regex pattern that is used to target messages to listen.
     * @param {Function} listener function to invoke when message that matches regex is received.
     *                  message received will be sent as first argument.
     * @returns {Function} a function which removes the listener when invoked.
     */
    public subscribe(messageAddressPattern, listener: (msg: Message) => any) {
        const handler = {
            pattern : new RegExp(messageAddressPattern),
            callBack : listener
        };
        this.handlers.push(handler);
        return () => _.remove(this.handlers, handler);
    }

}

(function (window, document) {
    'use strict';
    // listen app-to-app communication via url schemes
    function subString(str, begin, end) {
        end = end < 0 ? undefined : end;
        return (str && begin >= 0 && str.length > begin && str.substring(begin, end)) || undefined;
    }
    function indexOf(str, pattern) {
        return str && str.indexOf(pattern);
    }
    function extractData(url) {
        const str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#')),
            data = {};
        _.forEach(_.split(str, '&'), entry => {
            const esplits = entry.split('=');
            data[esplits[0]] = esplits[1];
        });
        return data;
    }
    function extractAddress(url) {
        return subString(url, indexOf(url, '://') + 3, indexOf(url, '?'));
    }
    function createMessage(url) {
        return {
            'address': extractAddress(url),
            'data': extractData(url)
        };
    }
    window['handleOpenURL'] = function (url) {
        const handleOpenURL = window['handleOpenURL'];
        if (handleOpenURL.isReady && !_.startsWith(url, 'http')) {
            const message = createMessage(url);
            const e = new window['CustomEvent']('externalAppMessageReceived', {
                'detail': {
                    'message': message
                }
            });
            document.dispatchEvent(e);
        }
        handleOpenURL.lastURL = url;
    };
}(window, document));
