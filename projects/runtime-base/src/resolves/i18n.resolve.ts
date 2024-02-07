import { Injectable } from '@angular/core';


import { AbstractI18nService } from '@wm/core';

@Injectable()
export class I18nResolve  {

    constructor(private i18nService: AbstractI18nService) {}

    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}
