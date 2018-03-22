import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { i18nService } from '../services/i18n.service';

@Injectable()
export class i18nResolve implements Resolve<any> {

    constructor(private i18nService: i18nService) {}

    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}