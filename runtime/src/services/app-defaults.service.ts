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

    setFormats(formats: any) {
        const dateFormat = formats.dateFormat;
        const timeFormat = formats.timeFormat;
        const dateTimeFormat = (dateFormat && timeFormat) ? dateFormat + ' ' + timeFormat : undefined;

        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.dateTimeFormat = dateTimeFormat;
    }
}