import { Injectable } from '@angular/core';

import { AppDefaults } from '@wm/core';

declare const _;

@Injectable()
export class AppDefaultsService implements AppDefaults {

    constructor() {
    }

    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    currencyCode: string;

    setFormats(formats: any) {
        const dateFormat = formats.date;
        const timeFormat = formats.time;
        const dateTimeFormat = (dateFormat && timeFormat) ? dateFormat + ' ' + timeFormat : undefined;
        const currency = formats.currency;

        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.dateTimeFormat = dateTimeFormat;
        this.currencyCode = currency;
    }
}
