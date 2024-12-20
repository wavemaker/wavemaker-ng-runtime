import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    loadScripts,
    replace,
    setCSS,
    setSessionStorageItem,
    App
} from '@wm/core';
import { CONSTANTS } from '@wm/variables';
import {find, forEach, get, includes, intersection, isObject, map, toLower} from "lodash-es";

declare const moment;

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
    private formatsByLocale = {'timezone': '', 'number': ''};
    private get app() { return this.inj.get(App) };

    private bundleLoaded:{[key:string] : any} = {};

    constructor(
        private $http: HttpClient,
        private bsLocaleService: BsLocaleService,
        private appDefaults: AppDefaults,
        private inj: Injector
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
        const basePath = _WM_APP_PROJECT.isPreview ? '' :  _WM_APP_PROJECT.cdnUrl
        this.loadResource( basePath + `${APP_LOCALE_ROOT_PATH}/${this.selectedLocale}.json`)
            .then(bundle => {
                this.extendMessages(bundle.messages);
                this.extendPrefabMessages(bundle);
                this.appDefaults.setFormats(bundle.formats);
                this.bundleLoaded.app = true;
                this.notifyLocaleChanged();
            });
    }

    protected loadMomentLocaleBundle(momentLocale) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
        if (this.selectedLocale === this.defaultSupportedLocale) {
            moment.locale(this.defaultSupportedLocale);
            return;
        }
        const path = _cdnUrl + `locales/moment/${momentLocale}.js`;
        loadScripts([path], true).then(()=>{
            moment.locale(this.selectedLocale);

            // For ngx bootstrap locale, get the config from script and apply locale
            // moment.localeData(momentLocale) will return moment locale instance. _config inside will have actual config
            let _config = moment.localeData(momentLocale);
            _config = _config && _config._config;
            defineLocale(this.selectedLocale, _config);
            this.bsLocaleService.use(this.getSelectedLocale() || this.defaultSupportedLocale);
            this.bundleLoaded.moment = true;
            this.notifyLocaleChanged();
        })
    }

    protected loadAngularLocaleBundle(angLocale) {
        return new Promise<void>(resolve => {
            const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
            if (this.selectedLocale === this.defaultSupportedLocale) {
                resolve();
                return;
            }
            const path = _cdnUrl + `locales/angular/global/${angLocale}.js`;

            loadScripts([path], true).then(()=>{
                this._isAngularLocaleLoaded = true;
                resolve();
            }, resolve);
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
            this.bundleLoaded.fullCalendar = true;
            return;
        }

        // Call the script. In script, moment defines the loaded locale
        return loadScripts([path], true);
    }

    protected loadMomentTimeZoneBundle(locale, compInstance?) {
        return new Promise<void>(resolve => {
            const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
            const path = _cdnUrl + `locales/moment-timezone/moment-timezone-with-data.js`;
            loadScripts([path], true).then(()=>{
                /**
                 * If locale is provided in the form of offset and not timezone name, deduce the name.
                 * If locale is provided as GMT+9, name will be deduced as Asia/Tokyo
                 */

                let localeObj = locale;
                locale = localeObj['timezone'];
                const localeIndex = locale.indexOf('+');
                if (localeIndex > -1) {
                    if (localeIndex > 0) {
                        locale = locale.substr(localeIndex);
                    }
                    localeObj['timezone'] = find(moment.tz.names(), (timezoneName) => {
                        return locale === moment.tz(timezoneName).format('Z');
                    });
                }
                moment.tz.setDefault(locale);
                const localeData =  compInstance && compInstance.formatsByLocale ? compInstance.formatsByLocale : this.formatsByLocale;
                Object.assign(localeData, localeObj);
                resolve();
            }, resolve);
        });
    }

    protected loadLocaleBundles(libLocale) {
        if (libLocale.moment) {
            this.loadMomentLocaleBundle(libLocale.moment);
        } else if (this.selectedLocale === this.defaultSupportedLocale) {
            this.bsLocaleService.use(this.getSelectedLocale() || this.defaultSupportedLocale);
            this.bundleLoaded.moment = true;
        }
        if (libLocale.fullCalendar && window['FullCalendar']) {
            this.loadCalendarLocaleBundle(libLocale.fullCalendar)?.then(() => {
                this.bundleLoaded.fullCalendar = true;
                this.notifyLocaleChanged();
            });
        } else {
            this.bundleLoaded.fullCalendar = true;
        }
        if (libLocale.angular) {
            this.loadAppLocaleBundle();
        }
        return this.loadAngularLocaleBundle(libLocale.angular);
    }

    public setTimezone(locale, compInstance?) {
        this.loadMomentTimeZoneBundle(locale, compInstance);
    }

    public getTimezone(compInstance?) {
        const pageConfig = get(this.app, 'activePage.formatsByLocale.timezone');
        const compConfig = get(compInstance, 'formatsByLocale.timezone');
        if (compConfig) {
            return compConfig;
        } else if (pageConfig) {
            return pageConfig;
        } else {
            return this.formatsByLocale['timezone'];
        }
    }

    public getFormatsByLocale() {
        return this.formatsByLocale;
    }

    public setSelectedLocale(locale) {

        // check if the event is propagated from the select or any such widget
        if (isObject(locale)) {
            // @ts-ignore
            locale = locale.datavalue;
        }

        const libLocale = getWmProjectProperties().supportedLanguages[locale];
        const supportedLocale = Object.keys(getWmProjectProperties().supportedLanguages);

        if (!includes(supportedLocale, locale)) {
            return Promise.resolve();
        }

        if (!locale || locale === this.selectedLocale) {
            return Promise.resolve();
        }

        setSessionStorageItem('selectedLocale', locale);

        this.selectedLocale = locale;

        // reset the localeData object
        this.init();

        this.bundleLoaded.moment = false;
        this.bundleLoaded.fullCalendar = false;
        this.bundleLoaded.app = false;
        this.bundleLoaded.angular = false;
        this.bundleLoaded.libLocale = libLocale;

        // load the locale bundles of the selected locale
        return this.loadLocaleBundles(libLocale).then(() => {
            this.updateLocaleDirection();
            this.bundleLoaded.angular = true;
            this.notifyLocaleChanged();
        });
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
            forEach(_acceptLang, function (lang) {
                let matchedLang = find(_supportedLang, (val) => lang === val) || find(_supportedLang, (val) => lang.startsWith(val));
                if (matchedLang) {
                    supportedLang.push(matchedLang);
                }
             })
            _appSupportedLang = supportedLang[0];
        }
        // check for the session storage to load any pre-requested locale
        const _defaultLang = getSessionStorageItem('selectedLocale') || _selectedDefaultLang || _appSupportedLang || intersection(_acceptLang, _supportedLang)[0] || this.defaultSupportedLocale;
        // if the supportedLocale is not available set it to defaultLocale
        _supportedLang = _supportedLang || [_defaultLang];

        const defaultLanguage = _defaultLang || _supportedLang[0];
        return defaultLanguage;
    }

    public loadDefaultLocale() {
        Date.prototype["month"] = Date.prototype.getMonth;
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
        return map(languages, toLower);
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

    public setwidgetLocale(locale) {
        this.formatsByLocale['number'] = locale['number'];
    }

    public getwidgetLocale() {
        return this.formatsByLocale;
    }

    private notifyLocaleChanged() {
        if(this.bundleLoaded.moment && this.bundleLoaded.fullCalendar && this.bundleLoaded.angular && this.bundleLoaded.app) {
            this.app.notify(  'locale-changed', this.bundleLoaded.libLocale);
        }
    }

}
