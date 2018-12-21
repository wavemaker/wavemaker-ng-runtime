import { Injectable } from '@angular/core';

import * as Utils from '../utils/utils';

declare const _;

@Injectable({providedIn: 'root'})
export class UtilsService {
    constructor() {
        _.assign(this, Utils);
    }
}
