import { Injectable } from '@angular/core';

import { App, getValidJSON } from '@wm/core';

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
    static readonly SERVICE_NAME = 'ExtAppMessageService';
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
    /**
     * returns if oAuth flow is implicit or pkce using state object in redirect_uri response.
     *
     * @param {url} string which contains access token and state information.
     * @returns {Boolean}
     */
    function getFlow(url) {
        if (!url) {
            return false;
        }
        const stateObj = url.match(/\{([^)]+)\}/);
        if (stateObj) {
            const parsedObj = getValidJSON('{' + stateObj[1] + '}');
            if (parsedObj && parsedObj.flow) {
                return parsedObj.flow;
            }
        }
        return false;
    }
    function extractData(url) {
        let str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#'));
        const data = {}, flow = getFlow(url);
        // access token comes as a hash for implicit flow
        if (flow === 'implicit') {
            str = url.match(/access_token=([^&#]*)/)[0];
        } else if (flow === 'pkce') {
            str = url.match(/code=([^&#]*)/)[0];
        }
        _.forEach(_.split(str, '&'), entry => {
            const esplits = entry.split('=');
            data[esplits[0]] = esplits[1];
        });
        return data;
    }
    function extractAddress(url) {
        // access token comes as a hash for implicit flow
        const addressKey = getFlow(url) === 'implicit' ? '#' : '?';
        return subString(url, indexOf(url, '://') + 3, indexOf(url, addressKey));
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
