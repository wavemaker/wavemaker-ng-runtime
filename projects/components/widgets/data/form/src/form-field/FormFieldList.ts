import { FormFieldDirective } from './form-field.directive';

declare const _;

export class FormFieldList extends Array<FormFieldDirective> {
    constructor(...items) {
        super(...items);
        Object.setPrototypeOf(this, Object.create(FormFieldList.prototype));
    }

    setValidators(validatorFn) {
        _.forEach(<Array<FormFieldDirective>>this, item => {
            item.setValidators(validatorFn);
        });
    }

    setAsyncValidators(validatorFn) {
        _.forEach(<Array<FormFieldDirective>>this, item => {
            item.setAsyncValidators(validatorFn);
        });
    }
}
