import { Injectable} from '@angular/core';
import { VALIDATOR } from '../utils/utils';

@Injectable({providedIn: 'root'})
export class ConstantService {
    MATCH_MODES = {
        STARTS_WITH_IGNORE_CASE: 'startignorecase',
        STARTS_WITH: 'start',
        ENDS_WITH_IGNORE_CASE: 'endignorecase',
        ENDS_WITH: 'end',
        CONTAINS: 'anywhere',
        CONTAINS_IGNORE_CASE: 'anywhereignorecase',
        IS_EQUAL_WITH_IGNORE_CASE: 'exactignorecase',
        IS_EQUAL: 'exact'
    };

    VALIDATOR = VALIDATOR;
}
