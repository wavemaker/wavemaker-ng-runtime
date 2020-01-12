import { FormComponent } from './form.component';
import { FormFieldList } from './form-field/FormFieldList';

declare const _;

export class FormList extends Array<FormComponent> {
    constructor(...items) {
        super(...items);
        Object.setPrototypeOf(this, Object.create(FormList.prototype));
    }

    field(name) {
        let list = [];
        _.forEach(<Array<FormComponent>>this, item => {
            const form = item.field(name);
            if (form.fieldsToValidate.length) {
                list = list.concat(form.fieldsToValidate);
            }
        });
        const widgetType = list[0].widgetType;

        if (widgetType === 'wm-form-field') {
            return new FormFieldList(...list);
        }
        if (widgetType === 'wm-form') {
            return new FormList(...list);
        }
    }
}
