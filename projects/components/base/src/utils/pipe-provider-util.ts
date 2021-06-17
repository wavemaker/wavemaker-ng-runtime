import {  ChangeDetectorRef, KeyValueDiffers, Pipe } from '@angular/core';

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
} from '../pipes/custom-pipes';
// import { getSessionStorageItem } from '@wm/core';

export class PipeUtilProvider {
      preparePipeMeta = (
        reference: Pipe,
        name: string,
        pure: boolean,
        diDeps = []) => ({
        type: { reference, diDeps },
        name,
        pure
    });
    getPipeData = ()=>{
        // getSessionStorageItem('selectedLocale') ||
       let _locale =   'en';

            let  _pipeData = [
                // TODO | NEED TO BE TESTED
                this.preparePipeMeta(AsyncPipe, 'async', false, [ChangeDetectorRef]),
                this.preparePipeMeta(SlicePipe, 'slice', false),
                this.preparePipeMeta(PercentPipe, 'percent', true, [_locale]),
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
                this.preparePipeMeta(DecimalPipe, 'number', true, [_locale]),
                this.preparePipeMeta(TitleCasePipe, 'titlecase', true),
                this.preparePipeMeta(CurrencyPipe, 'currency', true, [_locale]),
                this.preparePipeMeta(DatePipe, 'date', true, [_locale]),
                this.preparePipeMeta(ToDatePipe, 'toDate', true, [
                    new DatePipe(_locale)
                ]),
                this.preparePipeMeta(ToNumberPipe, 'toNumber', true, [
                    new DecimalPipe(_locale)
                ]),
                this.preparePipeMeta(ToCurrencyPipe, 'toCurrency', true, [
                    new DecimalPipe(_locale)
                ]),
                this.preparePipeMeta(PrefixPipe, 'prefix', true),
                this.preparePipeMeta(SuffixPipe, 'suffix', true),
                this.preparePipeMeta(TimeFromNowPipe, 'timeFromNow', true),
                this.preparePipeMeta(NumberToStringPipe, 'numberToString', true, [
                    new DecimalPipe(_locale)
                ]),
                this.preparePipeMeta(StringToNumberPipe, 'stringToNumber', true)
            ];
        
            
            return _pipeData;
        }
        getPipeNameVsIsPureMap = () => {
            const _map = new Map();
            let _pipeMeta = this.getPipeMeta();
        
            _pipeMeta.forEach((v, k) => {
                _map.set(k, v.pure);
            });
            return _map;
        }

        getPipeMeta = () => {
            let _pipeData = this.getPipeData();
            let _pipeMeta = new Map();
          
            _pipeData.forEach(v => {
                _pipeMeta.set(v.name, v);
            });
            return _pipeMeta;
        }
}

  
