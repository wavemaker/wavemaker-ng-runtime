import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';

import { BsLocaleService, defineLocale } from 'ngx-bootstrap';

import {
    _WM_APP_PROJECT,
    AbstractI18nService,
    AppDefaults,
    getSessionStorageItem,
    getWmProjectProperties,
    isMobile,
    isMobileApp,
    replace,
    setCSS,
    setSessionStorageItem
} from '@wm/core';
import { CONSTANTS } from '@wm/variables';

declare const _, moment;

const APP_LOCALE_ROOT_PATH = 'resources/i18n';
const RTL_LANGUAGE_CODES = ['ar', 'ar-001', 'ar-ae', 'ar-bh', 'ar-dz', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly',
    'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sd', 'ar-sy', 'ar-tn', 'ar-ye', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk',
    'he', 'ku', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];

@Injectable()
export class I18nServiceImpl extends AbstractI18nService {

    private selectedLocale: string;
    private defaultSupportedLocale = 'en';
    private readonly appLocale: any;
    private readonly prefabLocale: Map<String, any>;
    private messages: any;
    private _isAngularLocaleLoaded = false;

    constructor(
        private $http: HttpClient,
        private bsLocaleService: BsLocaleService,
        private appDefaults: AppDefaults
    ) {
        super();
        this.appLocale = {};
        this.prefabLocale = new Map();
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

    public getSelectedLocale(): string {
        return this.selectedLocale;
    }

    public getDefaultSupportedLocale(): string {
        return this.defaultSupportedLocale;
    }

    public getAppLocale(): any {
        return this.appLocale;
    }

    public getPrefabLocaleBundle(prefabName: string): any {
        if (!this.prefabLocale.has(prefabName)) {
            this.prefabLocale.set(prefabName, Object.create(this.appLocale));
        }
        return this.prefabLocale.get(prefabName);
    }

    private extendPrefabMessages(messages: any): void {
        if (!messages.prefabMessages) {
            return;
        }

        Object.keys(messages.prefabMessages).forEach((prefabName: string) => {
            let bundle = this.prefabLocale.get(prefabName);
            if (!bundle) {
                bundle = Object.create(this.appLocale);
                this.prefabLocale.set(prefabName, bundle);
            }
            Object.assign(bundle, messages.prefabMessages[prefabName]);
        });
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

    protected loadAppLocaleBundle() {
        this.loadResource(`${APP_LOCALE_ROOT_PATH}/${this.selectedLocale}.json`)
            .then(bundle => {
                this.extendMessages(bundle.messages);
                this.extendPrefabMessages(bundle);
                this.appDefaults.setFormats(bundle.formats);
            });
    }

    protected loadMomentLocaleBundle(momentLocale) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || '';
        if (this.selectedLocale === this.defaultSupportedLocale) {
            moment.locale(this.defaultSupportedLocale);
            return;
        }
        const path = _cdnUrl + `locales/moment/${momentLocale}.js`;
        this.$http.get(path, {responseType: 'text'})
            .toPromise()
            .then((response: any) => {
                const fn = new Function(response);

                // Call the script. In script, moment defines the loaded locale
                fn();
                moment.locale(this.selectedLocale);

                // For ngx bootstrap locale, get the config from script and apply locale
                let _config;
                fn.apply({moment: {defineLocale: (code, config) => _config = config}});
                defineLocale(this.selectedLocale, _config);
                this.bsLocaleService.use(this.getSelectedLocale() || this.defaultSupportedLocale);
            });
    }

    protected loadAngularLocaleBundle(angLocale) {
        return new Promise(resolve => {
            const _cdnUrl = _WM_APP_PROJECT.cdnUrl || '';
            if (this.selectedLocale === this.defaultSupportedLocale) {
                resolve();
                return;
            }
            const path = _cdnUrl + `locales/angular/${angLocale}.js`;

            this.$http.get(path, {responseType: 'text'})
                .toPromise()
                .then((response: any) => {
                    const module: any = {}, exports: any = {};
                    module.exports = exports;
                    const fn = new Function('module', 'exports', response);
                    fn(module, exports);
                    registerLocaleData(exports.default);
                    this._isAngularLocaleLoaded = true;
                    resolve();
                }, () => resolve());
        });
    }

    protected loadCalendarLocaleBundle(calendarLocale) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || '';
        let path: string;
        if (calendarLocale) {
            path = _cdnUrl + `locales/fullcalendar/${calendarLocale}.js`;
        } else {
            return Promise.resolve();
        }

        // return in case of mobile app or if selected locale is default supported locale.
        if (isMobile() || isMobileApp() || this.selectedLocale === this.defaultSupportedLocale) {
            return;
        }

        this.$http.get(path, {responseType: 'text'})
            .toPromise()
            .then((response: any) => {
                const fn = new Function(response);
                // Call the script. In script, moment defines the loaded locale
                fn();
            });
    }

    protected loadLocaleBundles(libLocale) {
        this.loadMomentLocaleBundle(libLocale.moment);
        this.loadAppLocaleBundle();
        this.loadCalendarLocaleBundle(libLocale.fullCalendar);
        return this.loadAngularLocaleBundle(libLocale.angular);
    }

    public setSelectedLocale(locale) {

        const libLocale = getWmProjectProperties().supportedLanguages[locale];
        const supportedLocale = Object.keys(getWmProjectProperties().supportedLanguages);

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
        return this.loadLocaleBundles(libLocale).then(() => this.updateLocaleDirection());
    }

    public loadDefaultLocale() {
        const _acceptLang = this.getAcceptedLanguages();
        _acceptLang.push(getWmProjectProperties().defaultLanguage);

        let _supportedLang = Object.keys(getWmProjectProperties().supportedLanguages) || [this.defaultSupportedLocale];

        // check for the session storage to load any pre-requested locale
        const _defaultLang = getSessionStorageItem('selectedLocale') || _.intersection(_acceptLang, _supportedLang)[0] || this.defaultSupportedLocale;

        // if the supportedLocale is not available set it to defaultLocale
        _supportedLang = _supportedLang || [_defaultLang];

        const defaultLanguage = _defaultLang || _supportedLang[0];
        return this.setSelectedLocale(defaultLanguage);
    }

    public getLocalizedMessage(message, ...args) {
        return replace(this.appLocale[message], args);
    }

    // This function returns the accepted languages list
    public getAcceptedLanguages() {
        let languages;
        if (CONSTANTS.hasCordova) {
            languages = navigator.languages || [navigator.language];
        } else {
            languages = getWmProjectProperties().preferredLanguage || '';
            /**
             * Accept-Language Header will contain set of supported locale, so try splitting the string to proper locale set
             * Ex: en,en-US;q=0.9,de;q=0.6,ar;q=0.2,hi
             *
             * Split the above into [en,en-us,de,ar,hi]
             * @type {Array}
             */
            languages = languages.split(',').map(function(locale) {
                return locale.split(';')[0];
            });
        }
        return _.map(languages, _.toLower);
    }

    public isAngularLocaleLoaded() {
        return this._isAngularLocaleLoaded;
    }

}
