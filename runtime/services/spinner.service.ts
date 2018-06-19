import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

declare const _;

@Injectable()
export class SpinnerService {
    spinnerId;
    messageSource = new Subject();

    constructor() {
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
    showContextSpinner() {
    }

    /**
     * show the app spinner with provided message
     * @param msg
     * @returns {string}
     */
    showAppSpinner(msg) {
        this.messageSource.next({
            show: true,
            message: msg
        });
        return 'globalSpinner';
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
        var spinnerScope;
        id      = id || ++this.spinnerId;
        //if spinnerContext is passed, then append the spinner to the element(default method for variable calls).
        if (spinnerContext && spinnerContext !== 'page') {
            //return after the compiled spinner is appended to the element reference
            return this.showContextSpinner();
        }

        return this.showAppSpinner(message);
    }

    /**
     * hide the spinner
     * @param spinnerId
     */
    hide(spinnerId) {
        if (spinnerId === 'globalSpinner') {
            this.messageSource.next({
                show: false
            })
        }
    }
}