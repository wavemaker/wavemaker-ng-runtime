import { Component, Injector } from '@angular/core';

import { $appDigest } from '@wm/utils';

import { styler } from '../../framework/styler';
import { registerProps } from './progress-bar.props';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';

registerProps();

declare const _;

const DEFAULT_CLS = 'progress app-progress';
const WIDGET_CONFIG = {widgetType: 'wm-progressbar', hostClass: DEFAULT_CLS};

const getDecimalCount = val => {
    val = val || '9';
    val = val.replace(/\%$/, '');

    const n = val.lastIndexOf('.');

    return (n === -1) ? 0 : (val.length - n - 1);
};

const isPercentageValue = val => {
    if (typeof val === 'string') {
        val = val.trim();
        return val.charAt(val.length - 1) === '%';
    }
    return false;
};

const areValuesValid = (max, min) => {
    if (!max || (!min && min !== 0) || (max <= min)) {
        return false;
    }
    return true;
};

@Component({
    selector: '[wmProgressBar]',
    templateUrl: './progress-bar.component.html'
})
export class ProgressBarComponent extends StylableComponent {


    isStriped: boolean = true;
    _type: string = 'success';
    binddatavalue;
    pollinterval;
    _invokeInterval;
    // boundServiceName;
    showCaption;
    progressDisplayValue;
    displayformat;
    minvalue;
    maxvalue;
    dataset;
    datavalue;
    _oldDV;
    _newDV;
    progressDataValue;

    onTypeChange(nv) {
        if (nv === 'default') {
            this._type = undefined;
            this.isStriped = false;
            return;
        }
        this.isStriped = _.includes(nv, '-striped');
        this._type = nv && nv.replace('-striped', '');
    }

    endPolling() {
        clearInterval(this._invokeInterval);
    }

    setupPolling() {
        this.endPolling();
        if (this.pollinterval) {
            this._invokeInterval = setInterval(() => {
                // TODO: invoke the service bound service name
                // call the event emitter to invoke the service
                /*this.servicesHandler.invokeService(
                            this.boundServiceName, {},
                            this.successHandler.bind(undefined)
                        ); */
            }, this.pollinterval);
        }
    }

    successHandler($response) {
        if (!this.binddatavalue) {
            invokeEventHandler(this, 'beforeupdate', {$response});
        }
    }
    // TODO: binddataset will be removed as per WM10 changes, fetch service information and handle the poll functionality later
    /*
    set binddataset (nv) {
        if (this._binddataset === nv) {
            return;
        }

        this._binddataset = nv;

        this.endPolling();

        if (_.isString(nv)) {
            nv = nv.replace('bind:Variables.', '');
            this.boundServiceName = nv.substr(0, nv.indexOf('.'));
            this.setupPolling();
        }
    }
    */

    updateProgressBar(oldDV?, newDV?) {

        oldDV = oldDV || this._oldDV;
        newDV = newDV || this._newDV;

        if (_.isArray(this.dataset)) {
            return;
        }

        const isValueAPercentage = isPercentageValue(this.datavalue);

        if (isValueAPercentage) {
            oldDV = parseInt(oldDV || 0, 10);
            newDV = parseInt(newDV || 0, 10);
        } else if (!areValuesValid(this.maxvalue, this.minvalue)) {
            this.endPolling();
            return;
        }

        this.triggerCallbackFunctions(oldDV, newDV, isValueAPercentage);

        if (isValueAPercentage) {
            this.progressDisplayValue = this.datavalue || '0%';
        } else if (typeof this.datavalue !== 'undefined') {
            this.progressDisplayValue = this.datavalue * 100 / (this.maxvalue - this.minvalue);
        } else {
            this.progressDisplayValue = 0;
        }
        const displayFormatAttr = this.nativeElement.getAttribute('displayformat');
        // support for old projects having percentage/ absolute displayformat
        if (displayFormatAttr !== 'ABSOLUTE') {
            this.progressDisplayValue = this.progressDisplayValue.toFixed(getDecimalCount(this.displayformat));
            if (_.includes(this.displayformat, '%')) {
                this.progressDisplayValue = this.progressDisplayValue + '%';
            }
        }
        this.progressDataValue = newDV;
    }

    triggerCallbackFunctions(oldDV, newDV, isPercentageVal) {
        let onStart, onComplete;
        if (isPercentageVal) {
            if (oldDV <= 0 && newDV > 0) {
                onStart = true;
            } else if (newDV >= 100) {
                onComplete = true;
            }
        } else {
            if (oldDV <= this.minvalue && newDV > this.minvalue) {
                onStart = true;
            } else if (newDV >= this.maxvalue) {
                onComplete = true;
            }
        }

        if (onStart) {
            invokeEventHandler(this, 'start');
        } else if (onComplete) {
            this.endPolling();
            invokeEventHandler(this, 'complete');
        }
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'type':
                this.onTypeChange(nv);
                break;
            case 'pollinterval':
                this.endPolling();
                if (typeof nv === 'number') {
                    this.setupPolling();
                }
                break;
            case 'captionplacement':
                this.showCaption = nv !== 'hidden';
                break;
            case 'minvalue':
            case 'maxvalue':
                this.updateProgressBar();
                break;
            case 'datavalue':
                this._oldDV = ov;
                this._newDV = nv;
                if (typeof nv === 'string' || typeof nv === 'number') {
                    this.updateProgressBar(ov, nv);
                }
                break;
            case 'dataset':
                if (_.isArray(nv)) {
                    this.progressDataValue = nv;
                }
                break;
        }
        $appDigest();
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
