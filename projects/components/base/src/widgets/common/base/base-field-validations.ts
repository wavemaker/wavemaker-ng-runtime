import {Validators} from '@angular/forms';

import {$unwatch, $watch, FormWidgetType, VALIDATOR} from '@wm/core';
import {
    cloneDeep,
    concat,
    extend,
    filter,
    find,
    forEach,
    get,
    isEmpty,
    isFunction,
    keys as _keys,
    toUpper
} from "lodash-es";

const DEFAULT_VALIDATOR = {
    pattern: 'regexp',
    max: 'maxvalue',
    min: 'minvalue',
    required: 'required',
    maxlength: 'maxchars',
    mindate: 'mindate',
    maxdate: 'maxdate',
    excludedates: 'excludedates',
    excludedays: 'excludedays',
    invalidNumber:'invalidNumber'
};

export class BaseFieldValidations {
    private hasValidators;

    // Instance of the directive table-column, form-field..
    private instance;
    // Inline form widget
    public formwidget;
    // Widget type
    private widgettype;
    // From control
    private widgetControl;
    // Parent widget context Table, Form..
    private widgetContext;
    // Optional table column type quickedit newrow/ inline edit
    private tableFieldType;

    private defaultValidatorMessages: any;
    private _syncValidators: any;
    private _asyncValidatorFn: any;

    constructor(instance, formwidget, widgettype, widgetControl, widgetContext, tableFieldType?){
        this.instance = instance;
        this.formwidget = formwidget;
        this.widgettype = widgettype;
        this.widgetControl = widgetControl;
        this.widgetContext = widgetContext;

        this.defaultValidatorMessages = [];
        if (tableFieldType) {
            this.tableFieldType = tableFieldType;
        }
    }

    // this method returns the collection of supported default validators
    private getDefaultValidators() {
        const _validator = [];
        if(!this.instance.show) return _validator;
        if(this.widgettype!== FormWidgetType.DATE && this.widgettype!==FormWidgetType.TIME && this.widgettype!==FormWidgetType.DATETIME) {
            if (this.instance.required) {
                // For checkbox/toggle widget, required validation should consider true value only
                if (this.widgettype === FormWidgetType.CHECKBOX || this.widgettype === FormWidgetType.TOGGLE) {
                    _validator.push(Validators.requiredTrue);
                } else {
                    _validator.push(Validators.required);
                }
            }
        }
        if (this.instance.maxchars) {
            _validator.push(Validators.maxLength(this.instance.maxchars));
        }
        if (this.instance.minvalue) {
            _validator.push(Validators.min(this.instance.minvalue));
        }
        if (this.instance.maxvalue && this.widgettype !== FormWidgetType.RATING) {
            _validator.push(Validators.max(this.instance.maxvalue));
        }
        if (this.instance.regexp) {
            _validator.push(Validators.pattern(this.instance.regexp));
        }
        if (this.formwidget && isFunction(this.formwidget.validate)) {
            _validator.push(this.formwidget.validate.bind(this.formwidget));
        }
        if((this.widgettype=== FormWidgetType.DATE|| this.widgettype===FormWidgetType.TIME ||this.widgettype===FormWidgetType.DATETIME) && this.instance.required){
            _validator.push(Validators.required);
        }
            return _validator;
    }

    // On change of any validation property, set the angular form validators
    setUpValidators(customValidator?) {
        if (this.hasValidators) {
            return;
        }
        this.instance._validators = this.getDefaultValidators();

        if (customValidator) {
            this.instance._validators.push(customValidator);
        }

        if (this.widgetContext.ngform) {
            this.widgetControl.setValidators(this.instance._validators);
            const opt = {};
            // updating the value only when prevData is not equal to current value. and also initially when  instance.value is empty or null for some widgets like date, checkboxset
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.formwidget && (this.instance.value === this.formwidget.prevDatavalue || this.isNullOrEmptyOrFalsy(this.instance.value))) {
                opt['emitEvent'] = false;
            }
            this.widgetControl.updateValueAndValidity(opt);
        }
    }

    getPromiseList(validators) {
        const arr = [];
        forEach(validators, (fn, index) => {
            let promise = fn;
            if (fn instanceof Function && fn.bind) {
                promise = fn(this.widgetControl, this.widgetContext);
            }
            if (promise instanceof Promise) {
                arr.push(promise);
            }
        });
        return arr;
    }

    // this method sets the asyncValidation on the form field. Assigns validationmessages from the returned response
    setAsyncValidators(validators) {
        this._asyncValidatorFn = () => {
            return () => {
                return Promise.all(this.getPromiseList(validators)).then(() => {
                    this.instance.validationmessage = '';
                    return null;
                }, err => {
                    // if err obj has validationMessage key, then set validationMessage using this value
                    // else return the value of the first key in the err object as validation message.
                    if (err.hasOwnProperty('errorMessage')) {
                        this.instance.validationmessage = get(err, 'errorMessage');
                    } else {
                        const keys = _keys(err);
                        this.instance.validationmessage = (err[keys[0]]).toString();
                    }
                    return err;
                }).then(response => {
                    // form control status is not changed from pending. This is an angular issue refer https://github.com/angular/angular/issues/13200
                    const checkForStatusChange = () => {
                        setTimeout(() => {
                            if (this.widgetControl.status === 'PENDING') {
                                checkForStatusChange();
                            } else {
                                this.instance.onStatusChange(this.widgetControl.status, this.tableFieldType);
                            }
                        }, 100);
                    };
                    checkForStatusChange();
                    return response;
                });
            };
        };

        this.widgetControl.setAsyncValidators([this._asyncValidatorFn()]);
        if(this.widgetContext.ngform.touched){
            const opt = {};
            // updating the value only when prevData is not equal to current value. and also initially when  instance.value is empty or null for some widgets like date, checkboxset
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.formwidget && (this.instance.value === this.formwidget.prevDatavalue || this.isNullOrEmptyOrFalsy(this.instance.value))) {
                opt['emitEvent'] = false;
            }
            this.widgetControl.updateValueAndValidity(opt);
        }
    }

    isDefaultValidator(type) {
        return get(VALIDATOR, toUpper(type));
    }

    // default validator is bound to a function then watch for value changes
    // otherwise set the value of default validator directly
    setDefaultValidator(key, value) {
        if (value && value instanceof Function) {
            // passing formfield and form as arguments to the default validator function
            this.watchDefaultValidatorExpr(value.bind(undefined, this.widgetControl, this.widgetContext), key);
        } else {
            if (this.widgettype === 'custom-widget') {
                this.instance.formWidget.baseWidget[key] = value;
            }
            this.instance.widget[key] = value;
            this.instance[key] = value;
        }
    }

    // sets the default validation on the form field
    setValidators(validators) {
        let _cloneValidators = cloneDeep(validators);
        this.hasValidators = true;
        this._syncValidators = [];
        forEach(_cloneValidators, (obj, index) => {
            // custom validation is bound to function.
            if (obj && obj instanceof Function) {
                // passing formfield and form as arguments to the obj (i.e. validator function)
                _cloneValidators[index] = obj.bind(undefined, this.widgetControl, this.widgetContext);
                this._syncValidators.push(_cloneValidators[index]);
            } else {
                // checks for default validator like required, maxchars etc.
                const key = get(obj, 'type');
                this.defaultValidatorMessages[key] = get(obj, 'errorMessage');
                if (this.isDefaultValidator(key)) {
                    const value = get(obj, 'validator');
                    this.setDefaultValidator(key, value);
                    _cloneValidators[index] = '';
                }
            }
        });

        // _syncValidators contains all the custom validations on the form field. will not include default validators.
        this._syncValidators = filter(_cloneValidators, val => {
            if (val) {
                return val;
            }
        });
        this.applyDefaultValidators();
    }

    observeOn(fields, context) {
        forEach(fields, field => {
            const formfield = find(this.widgetContext[context], {'key': field});
            if (formfield) {
                if (!formfield.notifyForFields) {
                    formfield.notifyForFields = [];
                }
                formfield.notifyForFields.push(this.instance);
            }
        });
    }

    validate() {
        this.applyDefaultValidators();
        if (this._asyncValidatorFn) {
            const opt = {};
            // updating the value only when prevData is not equal to current value. and also initially when  instance.value is empty or null for some widgets like date, checkboxset
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.formwidget && (this.instance.value === this.formwidget.prevDatavalue || this.isNullOrEmptyOrFalsy(this.instance.value))) {
                opt['emitEvent'] = false;
            }
            this.widgetControl.setAsyncValidators([this._asyncValidatorFn()]);
            this.widgetControl.updateValueAndValidity(opt);
        }
        // show the validation erros show when form is touched and not on load. This just highlights the field that is subscribed for changes.
        if (this.widgetContext.ngform.touched) {
            this.widgetControl.markAsTouched();
        }
    }

    // watches for changes in the bound function for default validators.
    watchDefaultValidatorExpr(fn, key) {
        const watchName = `${this.instance.widgetId}_` + key + '_formField';
        $unwatch(watchName);
        //[Todo-CSP]: Need clarity generate this expr fn if form is present in the page
        this.instance.registerDestroyListener($watch('boundFn(fn)', extend(this.instance, this.instance.viewParent), {fn}, (nv, ov) => {
            this.instance.widget[key] = nv;
            this.applyDefaultValidators();
        }, watchName));
    }
    isNullOrEmptyOrFalsy(value)  {
        return isEmpty(value);
    }

    // invokes both custom sync validations and default validations.
    applyDefaultValidators() {
        const validators = this.getDefaultValidators();
        const opt = {};
        // updating the value only when prevData is not equal to current value. and also initially when  instance.value is empty or null for some widgets like date, checkboxset
        // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
        if (this.formwidget && (this.instance.value === this.formwidget.prevDatavalue || this.isNullOrEmptyOrFalsy(this.instance.value))) {
            opt['emitEvent'] = false;
        }
        this.widgetControl.setValidators(concat(this._syncValidators || [], validators));
        this.widgetControl.updateValueAndValidity(opt);
        this.setCustomValidationMessage();
    }

    setCustomValidationMessage() {
        const fieldErrors = this.widgetControl && this.widgetControl.errors;

        if (!fieldErrors) {
            return;
        }
        if (fieldErrors.hasOwnProperty('errorMessage')) {
            this.instance.validationmessage = get(fieldErrors, 'errorMessage');
        } else {
            const keys = _keys(fieldErrors);
            const key = keys[0];
            const validationMsgKey = get(DEFAULT_VALIDATOR, key) || this.formwidget.validateType;
            if (validationMsgKey) {
                const msg = get(this.defaultValidatorMessages, validationMsgKey) || this.instance.validationmessage;
                if (msg && msg instanceof Function) {
                    // passing formfield and form as arguments to the errorMessage function.
                    this.instance.validationmessage = msg(this.widgetControl, this.widgetContext);
                } else {
                    this.instance.validationmessage = msg;
                }
            } else {
                // fallback when there is no validationmessage for fields other than default validators.
                this.instance.validationmessage = '';
            }
        }
    }
}
