import { Injectable } from '@angular/core';
import { getSessionStorageItem, replace, setSessionStorageItem } from '@utils/utils';
import { HttpClient } from '@angular/common/http';

let localeData: any;
let selectedLocale: string;

declare const $, _, moment, _WM_APP_PROPERTIES;

const _appLocaleRootPath = 'resources/i18n/';
const NG_LOCALE_PATH = 'resources/ngLocale/';
const MOMENT_LOCALE_PATH = 'resources/momentLocale/';
const RTL_LANGUAGE_CODES = ['ar', 'ar-001', 'ar-ae', 'ar-bh', 'ar-dz', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly',
    'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sd', 'ar-sy', 'ar-tn', 'ar-ye', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk',
    'he', 'ku', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];
const localeKey = 'appLocale';

const getLocalizedMessage = function () {
    const args = Array.prototype.slice.call(arguments),
        key  = localeData[localeKey][args.shift()];

    return replace(key, args);
};

const setApplicationLocaleDirection = () => {
    if (_.includes(RTL_LANGUAGE_CODES, selectedLocale)) {
        $('body').css('direction', 'rtl');
    } else {
        $('body').css('direction', 'ltr');
    }
};

@Injectable()
export class I18nService {

    getAppLocale() {
        return Object.assign({}, localeData);
    }

    constructor(private $http: HttpClient) {

    }
    // TODO: Extend the locale for ng locale
    extendLocale(dst, src) {
        dst.id        = src.id;
        dst.pluralCat = src.pluralCat;

        ['DATETIME_FORMATS', 'NUMBER_FORMATS'].forEach(function (type) {
            _.keys(src[type]).forEach(function (key) {
                dst[type][key] = src[type][key];
            });
        });
    }

    loadAppLocaleBundle(content = {}) {
        const path = _appLocaleRootPath + selectedLocale + '.json';
        // load the localeBundle
        return new Promise((resolve, reject) => {
            this.$http
                .get(path)
                .subscribe( (response: any) => {
                    resolve();
                    setApplicationLocaleDirection();
                    // extend the $rs.locale object with the response json
                    Object.assign(localeData, response, content);
                }, function () {
                    // error case
                    localeData = {};
                    reject();
                    console.warn(`Error while loading the message bundle for locale(${selectedLocale})` );
                });
        });
    }

    loadMomentLocaleBundle() {
        return new Promise((resolve, reject) => {
            let path;
            if (!_appLocaleRootPath || selectedLocale === 'en') {
                moment.locale('en');
                resolve();
                return;
            }
            path = MOMENT_LOCALE_PATH +  selectedLocale + '.js';
            // load the script tag
            $.ajax({
                'dataType' : 'script',
                'url'      : path,
                'cache'    : true // read the script tag from the cache when available
            }).always(function () {
                moment.locale(selectedLocale);
                resolve();
            });
        });
    }

    loadLocaleBundles() {
        return this.loadAppLocaleBundle().then(this.loadMomentLocaleBundle);
    }

    loadDefaultLocale() {
        const defaultLanguage = getSessionStorageItem('selectedLocale') || _WM_APP_PROPERTIES.defaultLanguage;
        return this.setSelectedLocale(defaultLanguage);
    }

    setSelectedLocale(locale) {

        const supportedLocale = _.split(_WM_APP_PROPERTIES.supportedLanguages, ',');

        // check if the event is propagated from the select or any such widget
        if (_.isObject(locale)) {
            locale = locale.datavalue;
        }

        if (!_.includes(supportedLocale, locale)) {
            return Promise.resolve();
        }

        if (!locale || locale === selectedLocale) {
            return Promise.resolve();
        }

        setSessionStorageItem('selectedLocale', locale);

        selectedLocale = locale;

        // reset the localeData object
        localeData = {};

        // load the locale bundles of the selected locale
        return this.loadLocaleBundles();
    }

}
