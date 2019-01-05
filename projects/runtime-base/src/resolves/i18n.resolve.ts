import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AbstractI18nService } from '@wm/core';

@Injectable()
export class I18nResolve implements Resolve<any> {

    constructor(private i18nService: AbstractI18nService) {}

    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}
