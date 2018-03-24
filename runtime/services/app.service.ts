import { Injectable } from '@angular/core';
import { I18nService } from './i18n.service';

const noop = () => {};

@Injectable()
export class App {
    onAppVariablesReady = noop;
    onSessionTimeout = noop;
    onPageReady = noop;
    onServiceError =  noop;

    changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);

    reload() {
        window.location.reload();
    }

    constructor(private i18nService: I18nService) {}
}
