import { Compiler, Injectable, Injector, ChangeDetectorRef, InjectionToken, KeyValueDiffers, Pipe, Inject } from '@angular/core';
import {
    AsyncPipe,
    UpperCasePipe,
    LowerCasePipe,
    JsonPipe,
    SlicePipe,
    DecimalPipe,
    PercentPipe,
    TitleCasePipe,
    CurrencyPipe,
    DatePipe,
    I18nPluralPipe,
    I18nSelectPipe,
    KeyValuePipe,
    NgLocalization
} from '@angular/common'
import {
    SuffixPipe,
    ToDatePipe,
    FileIconClassPipe,
    FileExtensionFromMimePipe,
    FilterPipe,
    FileSizePipe,
    ToNumberPipe,
    ToCurrencyPipe,
    PrefixPipe,
    TimeFromNowPipe,
    NumberToStringPipe,
    StateClassPipe,
    StringToNumberPipe,
    CustomPipe,
    TrustAsPipe,
    SanitizePipe,
    TemplateReplacePipe
} from '@wm/components/base';
import { getSessionStorageItem, CustomPipeManager, AbstractI18nService } from '@wm/core';
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})
export class PipeProvider {
    _pipeMeta;
    _locale = getSessionStorageItem('selectedLocale') || 'en';
    formatsByLocale;
    preparePipeMeta = (
        reference: Pipe,
        name: string,
        pure: boolean,
        diDeps = []
    ) => ({
        type: { reference, diDeps },
        name,
        pure
    });
    _pipeData = [];

    setPipeData() {
        this._pipeData = [
            // TODO | NEED TO BE TESTED
            this.preparePipeMeta(AsyncPipe, 'async', false, [ChangeDetectorRef]),
            this.preparePipeMeta(SlicePipe, 'slice', false),
            this.preparePipeMeta(PercentPipe, 'percent', true, [this._locale]),
            this.preparePipeMeta(I18nPluralPipe, 'i18nPlural', true, [
                NgLocalization
            ]),
            this.preparePipeMeta(I18nSelectPipe, 'i18nSelect', true),
            this.preparePipeMeta(KeyValuePipe, 'keyvalue', false, [
                KeyValueDiffers
            ]),
            this.preparePipeMeta(FileIconClassPipe, 'fileIconClass', true),
            this.preparePipeMeta(
                FileExtensionFromMimePipe,
                'fileExtensionFromMime',
                true
            ),
            this.preparePipeMeta(StateClassPipe, 'stateClass', true),
            this.preparePipeMeta(FileSizePipe, 'filesize', true),
            // TESTED
            this.preparePipeMeta(FilterPipe, 'filter', true),
            this.preparePipeMeta(UpperCasePipe, 'uppercase', true),
            this.preparePipeMeta(LowerCasePipe, 'lowercase', true),
            this.preparePipeMeta(JsonPipe, 'json', false),
            this.preparePipeMeta(DecimalPipe, 'number', true, [this._locale]),
            this.preparePipeMeta(TitleCasePipe, 'titlecase', true),
            this.preparePipeMeta(CurrencyPipe, 'currency', true, [this._locale]),
            this.preparePipeMeta(DatePipe, 'date', true, [this._locale]),
            this.preparePipeMeta(ToDatePipe, 'toDate', true, [
                new DatePipe(this._locale), undefined, this.injector.get(CustomPipeManager)
            ]),
            this.preparePipeMeta(ToNumberPipe, 'toNumber', true, [
                new DecimalPipe(this._locale),
                this.i18service
            ]),
            this.preparePipeMeta(ToCurrencyPipe, 'toCurrency', true, [
                new DecimalPipe(this._locale),
                this.i18service
            ]),
            this.preparePipeMeta(PrefixPipe, 'prefix', true),
            this.preparePipeMeta(SuffixPipe, 'suffix', true),
            this.preparePipeMeta(TimeFromNowPipe, 'timeFromNow', true),
            this.preparePipeMeta(NumberToStringPipe, 'numberToString', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(StringToNumberPipe, 'stringToNumber', true),
            this.preparePipeMeta(CustomPipe, 'custom', true, [this.injector.get(CustomPipeManager)]),
            this.preparePipeMeta(TrustAsPipe, 'trustAs', true, [this.domSanitizer]),
            this.preparePipeMeta(SanitizePipe, 'sanitize', true, [this.domSanitizer]),
            this.preparePipeMeta(TemplateReplacePipe, 'templateReplace', true),
        ];
    }


    unknownPipe(name) {
        throw Error(`The pipe '${name}' could not be found`);
    }

    constructor(private compiler: Compiler, private injector: Injector, private domSanitizer:DomSanitizer, private i18service: AbstractI18nService) {
        this._pipeMeta = new Map();
        this.setPipeData();
        this._pipeData.forEach(v => {
            this._pipeMeta.set(v.name, v);
        });
        this.formatsByLocale = this.i18service? this.i18service.getwidgetLocale() : {};
    }

    meta(name) {
        const meta = this._pipeMeta.get(name);
        if (!meta) {
            this.unknownPipe(name);
        }
        return meta;
    }

    getPipeNameVsIsPureMap() {
        const _map = new Map();
        this._pipeMeta.forEach((v, k) => {
            _map.set(k, v.pure);
        });
        return _map;
    }

    resolveDep(dep) {
        return this.injector.get(dep.token.identifier.reference);
    }

    getInstance(name) {
        const {
            type: { reference: ref, diDeps: deps }
        } = this.meta(name);
        if (!ref) {
            this.unknownPipe(name);
        }

        if (!deps.length) {
            return new ref();
        } else {
            const args = [];
            for (const dep of deps) {
                args.push(dep);
            }
            return new ref(...args);
        }
    }
}
