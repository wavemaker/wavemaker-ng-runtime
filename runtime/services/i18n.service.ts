import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {getSessionStorageItem, AbstractI18nService, replace, setCSS, setSessionStorageItem} from '@wm/core';

declare const $, _, moment, _WM_APP_PROPERTIES;

const APP_LOCALE_ROOT_PATH = 'resources/i18n';
const MOMENT_LOCALE_PATH = 'resources/momentLocale';
const RTL_LANGUAGE_CODES = ['ar', 'ar-001', 'ar-ae', 'ar-bh', 'ar-dz', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly',
    'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sd', 'ar-sy', 'ar-tn', 'ar-ye', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk',
    'he', 'ku', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];

@Injectable()
export class I18nServiceImpl extends AbstractI18nService {

    private selectedLocale: string;
    private readonly appLocale: any;
    private messages: any;

    private componentLocalePaths = [];

    constructor(private $http: HttpClient) {
        super();
        this.appLocale = {};
    }

    private updateLocaleDirection() {
        let direction: 'ltr' | 'rtl' = 'ltr';
        if (RTL_LANGUAGE_CODES.includes(this.selectedLocale)) {
            direction = 'rtl';
        }

        setCSS(document.body, 'direction', direction);
    }

    private init() {
        this.messages = {};

        Object.setPrototypeOf(this.appLocale, this.messages);
    }

    public registerLocalePath(path: string) {
        if (!path) {
            return;
        }
        if (!this.componentLocalePaths.includes(path)) {
            this.componentLocalePaths.push(path);
        }

        this.loadComponentLocaleBundle(`${path}/${this.selectedLocale}.json`);
    }

    public getSelectedLocale(): string {
        return this.selectedLocale;
    }

    public getAppLocale(): any {
        return this.appLocale;
    }

    private extendMessages(messages: any): void {
        Object.assign(this.messages, messages);
    }

    private loadResource(path): Promise<any> {
        return this.$http.get(path)
            .toPromise()
            .catch(() => {
                console.warn(`error loading locale resource from ${path}`);
                Promise.resolve({});
            });
    }

    protected loadComponentLocaleBundle(path) {
        return this.loadResource(`${path}/${this.selectedLocale}.json`)
            .then(messages => this.extendMessages(messages));
    }

    protected loadComponentLocaleBundles(): Promise<any> {
        if (!this.componentLocalePaths.length) {
            return Promise.resolve({});
        }

        const promises: Array<Promise<any>> = [];

        for (const path of this.componentLocalePaths) {
            promises.push(this.loadComponentLocaleBundle(path));
        }

        return Promise.all(promises);
    }

    protected loadAppLocaleBundle() {
        return this.loadResource(`${APP_LOCALE_ROOT_PATH}/${this.selectedLocale}.json`)
            .then(messages => this.extendMessages(messages));
    }

    protected loadMomentLocaleBundle() {
        return new Promise((resolve, reject) => {
            let path;
            if (!APP_LOCALE_ROOT_PATH || this.selectedLocale === 'en') {
                moment.locale('en');
                resolve();
                return;
            }
            path = `${MOMENT_LOCALE_PATH}/${this.selectedLocale}.js`;
            // load the script tag
            $.ajax({
                dataType: 'script',
                url: path,
                cache: true // read the script tag from the cache when available
            }).always(() => {
                moment.locale(this.selectedLocale);
                resolve();
            });
        });
    }

    protected loadLocaleBundles() {
        return this.loadComponentLocaleBundles()
            .then(() => this.loadMomentLocaleBundle())
            .then(() => this.loadAppLocaleBundle());
    }

    public setSelectedLocale(locale) {

        const supportedLocale = _.split(_WM_APP_PROPERTIES.supportedLanguages, ',');

        // check if the event is propagated from the select or any such widget
        if (_.isObject(locale)) {
            locale = locale.datavalue;
        }

        if (!_.includes(supportedLocale, locale)) {
            return Promise.resolve();
        }

        if (!locale || locale === this.selectedLocale) {
            return Promise.resolve();
        }

        setSessionStorageItem('selectedLocale', locale);

        this.selectedLocale = locale;

        // reset the localeData object
        this.init();

        // load the locale bundles of the selected locale
        return this.loadLocaleBundles().then(() => this.updateLocaleDirection());
    }

    public loadDefaultLocale() {
        const defaultLanguage = getSessionStorageItem('selectedLocale') || _WM_APP_PROPERTIES.defaultLanguage;
        return this.setSelectedLocale(defaultLanguage);
    }

    public getLocalizedMessage(message, ...args) {
        return replace(this.appLocale[message], args);
    }

}
