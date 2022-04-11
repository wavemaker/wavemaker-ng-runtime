import { Injectable } from '@angular/core';

import * as Utils from '../utils/utils';

import * as _ from 'lodash-es';

@Injectable({providedIn: 'root'})
export class UtilsService {
    constructor() {
        _.assign(this, Utils);
    }
}
