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
    StringToNumberPipe
} from '@wm/components/base';
import { getSessionStorageItem, UserCustomPipeManager } from '@wm/core';
declare const window;
@Injectable({
    providedIn: 'root'
})
export class PipeProvider {
    _pipeMeta;
    _locale = getSessionStorageItem('selectedLocale') || 'en';
    preparePipeMeta = (
        reference: Pipe,
        name: string,
        pure: boolean,
        diDeps = []
    ) => ({
        type: { reference, diDeps },
        name,
        pure
    })
    _pipeData = [
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
            new DatePipe(this._locale)
        ]),
        this.preparePipeMeta(ToNumberPipe, 'toNumber', true, [
            new DecimalPipe(this._locale)
        ]),
        this.preparePipeMeta(ToCurrencyPipe, 'toCurrency', true, [
            new DecimalPipe(this._locale)
        ]),
        this.preparePipeMeta(PrefixPipe, 'prefix', true),
        this.preparePipeMeta(SuffixPipe, 'suffix', true),
        this.preparePipeMeta(TimeFromNowPipe, 'timeFromNow', true),
        this.preparePipeMeta(NumberToStringPipe, 'numberToString', true, [
            new DecimalPipe(this._locale)
        ]),
        this.preparePipeMeta(StringToNumberPipe, 'stringToNumber', true),
        // this.preparePipeMeta(WmPipe, 'wmpipe', true, [this.injector.get(UserCustomPipeManager)])
    ];

    setPipeMeta(pipeRef, pipeName){

        window[pipeName] = function(){
        };
        window[pipeName].prototype.transform = function(value, param1, param2){
          return  pipeRef(value, param1, param2);
        }

        window[pipeName].decorators = [
            { type: Pipe, args: [{ name: pipeName },] }
        ];
        window[pipeName].ctorParameters = () => [
            { type: String, decorators: [{ type: Inject, args: [] }] }
        ];


        let preparePipeMeta = this.preparePipeMeta(window[pipeName], pipeName, true);
        this._pipeData.push(preparePipeMeta);
        this._pipeMeta.set(preparePipeMeta.name, preparePipeMeta);
    }

    unknownPipe(name) {
        throw Error(`The pipe '${name}' could not be found`);
    }

    constructor(private compiler: Compiler, private injector: Injector) {
        this._pipeMeta = new Map();
        this._pipeData.forEach(v => {
            this._pipeMeta.set(v.name, v);
        });
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
