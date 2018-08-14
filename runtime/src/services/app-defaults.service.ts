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
}