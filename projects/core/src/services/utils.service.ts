import { Injectable } from '@angular/core';

import * as Utils from '../utils/utils';
import {assign} from "lodash-es";

@Injectable({providedIn: 'root'})
export class UtilsService {
    constructor() {
        assign(this, Utils);
    }
}
