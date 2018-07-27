import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { AbstractSpinnerService } from '@wm/core';

declare const _;

@Injectable()
export class SpinnerServiceImpl extends AbstractSpinnerService {
    spinnerId;
    messageSource = new Subject();
    messagesByContext = {};

    constructor() {
        super();
    }

    /**
     * returns the message source subject
     * @returns {Subject<any>}
     */
    getMessageSource() {
        return this.messageSource;
    }

    /**
     * show spinner on a container element
     * yet to implement
     */
    showContextSpinner() {}

    /**
     * show the app spinner with provided message
     * @param msg
     * @returns {string}
     */
    showAppSpinner(msg, id) {
        const ctx = 'page';
        this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
        this.messagesByContext[ctx][id] = msg;

        this.messageSource.next({
            show: true,
            message: msg,
            messages: _.values(this.messagesByContext[ctx])
        });
    }

    /**
     * hides the spinner on a particular container(context)
     * yet to implement
     * @param ctx
     * @param id
     */
    hideContextSpinner(ctx, id) {}

    /**
     * show spinner
     * @param message
     * @param id
     * @param spinnerClass
     * @param spinnerContext
     * @param variableScopeId
     * @returns {any}
     */
    show(message, id?, spinnerClass?, spinnerContext?, variableScopeId?) {
        id      = id || ++this.spinnerId;
        // if spinnerContext is passed, then append the spinner to the element(default method for variable calls).
        if (spinnerContext && spinnerContext !== 'page') {
            // return after the compiled spinner is appended to the element reference
            return this.showContextSpinner();
        }

        this.showAppSpinner(message, id);
        return id;
    }

    /**
     * hide the spinner
     * @param spinnerId
     */
    hide(id) {
        // find the spinner context of the id from the messagesByContext
        const ctx = _.findKey(this.messagesByContext, function (obj) {
            return _.includes(_.keys(obj), id);
        });

        // sanity check
        if (!ctx) {
            return;
        }

        // if spinnerContext exists just remove the spinner from the reference and destroy the scope associated.
        if (ctx !== 'page') {
            this.hideContextSpinner(ctx, id);
            return;
        }

        if (id) {
            delete this.messagesByContext[ctx][id];
            const messages = _.values(this.messagesByContext[ctx]);
            this.messageSource.next({
                show: messages.length ? true : false,
                messages: _.values(this.messagesByContext[ctx])
            });
        } else {
            this.messagesByContext[ctx] = {};
        }
    }
}