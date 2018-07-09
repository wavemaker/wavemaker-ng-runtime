import { Injectable } from '@angular/core';

import * as Utils from './utils';

declare const _;

@Injectable()
export class UtilsService {
    constructor() {
        _.assign(this, Utils);
    }
}