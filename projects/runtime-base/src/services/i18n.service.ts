import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

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
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
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
                // TODO: Moved ngxBootstrap locale configuration to app.module.ts
                defineLocale(this.selectedLocale, _config);
                this.bsLocaleService.use(this.getSelectedLocale() || this.defaultSupportedLocale);
            });
    }

    protected loadAngularLocaleBundle(angLocale) {
        return new Promise<void>(resolve => {
            const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
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

    protected loadCalendarLocaleBundle(calendarLocale, force = false) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
        let path: string;
        if (calendarLocale) {
            path = _cdnUrl + `locales/fullcalendar/${calendarLocale}.js`;
        } else {
            return Promise.resolve();
        }

        // return in case of mobile app or if selected locale is default supported locale.
        if (!force && (isMobile() || isMobileApp() || this.selectedLocale === this.defaultSupportedLocale)) {
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
        if (libLocale.moment) {
            this.loadMomentLocaleBundle(libLocale.moment);
        }
        if (libLocale.fullCalendar && window['FullCalendar']) {
            this.loadCalendarLocaleBundle(libLocale.fullCalendar);
        }
        if (libLocale.angular) {
            this.loadAppLocaleBundle();
        }
        return this.loadAngularLocaleBundle(libLocale.angular);
    }

    public setSelectedLocale(locale) {

        // check if the event is propagated from the select or any such widget
        if (_.isObject(locale)) {
            locale = locale.datavalue;
        }

        const libLocale = getWmProjectProperties().supportedLanguages[locale];
        const supportedLocale = Object.keys(getWmProjectProperties().supportedLanguages);

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

    private deduceAppLocale() {
        // computation to find app default locale
        const _acceptLang = this.getAcceptedLanguages();
        const _defaultLanguage = getWmProjectProperties().defaultLanguage;
        _acceptLang.push(_defaultLanguage);

        // checks whether user preference is based on browser set languages or default language set in project
        let preferBrowserLang = getWmProjectProperties().preferBrowserLang;
        if (!preferBrowserLang) { // when preferBrowserLang is not defined, set to its default value
            preferBrowserLang  = true;
        } else { // convert stringified boolean values recieved from BE to booleans
            preferBrowserLang= (preferBrowserLang === 'true' || preferBrowserLang === true) ? true : false;
        }

        let _supportedLang = Object.keys(getWmProjectProperties().supportedLanguages) || [this.defaultSupportedLocale];

        // when preference is given to browser set languages, do not populate _selectedDefaultLang variable
        let _selectedDefaultLang = preferBrowserLang ? undefined : _defaultLanguage;

        let _appSupportedLang;
        /**
         * for cordova, check for language ignoring the locale
         * As the navigator.languages always returns the language with locale (en-us)
         * The supportedLanguages from BE doesn't include locale (en) which leads to mismatch
         */
        if (CONSTANTS.hasCordova) {
            let supportedLang = [];
            _.forEach(_acceptLang, function(lang) {
                let matchedLang = _.find(_supportedLang, (val) => lang === val) || _.find(_supportedLang, (val) => lang.startsWith(val));
                if (matchedLang) {
                    supportedLang.push(matchedLang);
                }
             })
            _appSupportedLang = supportedLang[0];
        }
        // check for the session storage to load any pre-requested locale
        const _defaultLang = getSessionStorageItem('selectedLocale') || _selectedDefaultLang || _appSupportedLang || _.intersection(_acceptLang, _supportedLang)[0] || this.defaultSupportedLocale;
        // if the supportedLocale is not available set it to defaultLocale
        _supportedLang = _supportedLang || [_defaultLang];

        const defaultLanguage = _defaultLang || _supportedLang[0];
        return defaultLanguage;
    }

    public loadDefaultLocale() {
        const locale = this.deduceAppLocale();
        return this.setSelectedLocale(locale);
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
            languages = decodeURIComponent(getWmProjectProperties().preferredLanguage || '');
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

    public initCalendarLocale(): Promise<any> {
        if (this.selectedLocale !== 'en') {
            return this.loadCalendarLocaleBundle(this.selectedLocale, true);
        }
        return Promise.resolve();
    }

    public isAngularLocaleLoaded() {
        return this._isAngularLocaleLoaded;
    }

}
