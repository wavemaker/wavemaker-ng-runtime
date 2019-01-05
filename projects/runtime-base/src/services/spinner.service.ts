import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { AbstractSpinnerService } from '@wm/core';

declare const _, $;

const spinnerTemplate = `<div class="app-spinner">
                            <div class="spinner-message" aria-label="loading gif">
                                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                                <div class="spinner-messages">
                                    <p class="spinner-messages-container"></p>
                               </div>
                            </div>
                         </div>`;

@Injectable()
export class SpinnerServiceImpl extends AbstractSpinnerService {
    spinnerId = 0;
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
     */
    showContextSpinner(ctx: string, message: string, id: string) {
        const ctxMarkup = $('[name="' + ctx + '"]');
        this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
        // If the spinner already exists on the context
        // then just append the message to the existing spinner message
        // else add a new spinner
        if (Object.keys(this.messagesByContext[ctx]).length !== 0 ) {
            this.messagesByContext[ctx][id] = message;
            this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx]['finalMessage'] + ' ' + this.messagesByContext[ctx][id];
            ctxMarkup.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
        } else {
            const ctxSpinnerTemp = $(spinnerTemplate);
            this.messagesByContext[ctx][id] = message;
            this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx][id];
            ctxSpinnerTemp.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
            ctxMarkup.prepend(ctxSpinnerTemp);
        }
        return id;
    }

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
    hideContextSpinner(ctx, id) {
        delete this.messagesByContext[ctx][id];
        if (Object.keys(this.messagesByContext[ctx]).length === 1) {
            this.messagesByContext[ctx] = {};
        }
        const ctxMarkup = $('[name="' + ctx + '"]');
        ctxMarkup.find('.app-spinner').remove();
    }

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
            return this.showContextSpinner(spinnerContext, message, id);
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
        }) || 'page';

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
