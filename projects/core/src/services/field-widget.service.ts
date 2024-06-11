import { Injectable } from '@angular/core';
import {assign} from "lodash-es";

@Injectable({providedIn: 'root'})
export class FieldWidgetService {
    constructor() {
        assign(this, {
            TEXT : 'text',
            NUMBER : 'number',
            TEXTAREA : 'textarea',
            PASSWORD : 'password',
            CHECKBOX : 'checkbox',
            SLIDER : 'slider',
            RICHTEXT : 'richtext',
            CURRENCY : 'currency',
            SWITCH : 'switch',
            SELECT : 'select',
            CHECKBOXSET : 'checkboxset',
            RADIOSET : 'radioset',
            DATE : 'date',
            TIME : 'time',
            TIMESTAMP : 'timestamp',
            UPLOAD : 'upload',
            RATING : 'rating',
            DATETIME : 'datetime',
            AUTOCOMPLETE : 'autocomplete',
            CHIPS : 'chips',
            COLORPICKER : 'colorpicker'
        });
    }
}
