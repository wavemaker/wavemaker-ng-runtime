import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { I18nService } from '../services/i18n.service';

@Injectable()
export class I18nResolve implements Resolve<any> {

    constructor(private i18nService: I18nService) {}

    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}