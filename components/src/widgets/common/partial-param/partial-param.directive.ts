import { Attribute, Directive, Inject, Input, Self } from '@angular/core';

import { $watch } from '@wm/core';

import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { WidgetRef } from '../../../widgets/framework/types';
import { Subject } from 'rxjs/Subject';

@Directive({
    selector: '[partialContainer][content]:not([content="inline"]), [partialContainer][content.bind]',
})
export class PartialParamHandlerDirective {
    constructor (@Self() @Inject(WidgetRef) private widgetRef) {
        this.widgetRef.partialParams = {};
        this.widgetRef.params$ = new Subject();
    }

    registerParams(name: string, value: string, bindExpr: string, type: string) {
        this.widgetRef.partialParams[name] = value;
        if (!value && bindExpr) {
            this.widgetRef.registerDestroyListener(
                $watch(bindExpr, this.widgetRef.getViewParent(), undefined, nv => {
                    this.widgetRef.partialParams[name] = nv;

                    // notify the partial container of the param changes
                    this.widgetRef.params$.next();
                })
            );
        }

    }
}

@Directive({
    selector: '[wmParam]',
    providers: [
        provideAsWidgetRef(PartialParamDirective)
    ]
})
export class PartialParamDirective {

    constructor(
        @Attribute('name') private name,
        @Attribute('value') private value,
        @Attribute('value.bind') private bindValue,
        @Attribute('type') private type,
        private partialParamsProvider: PartialParamHandlerDirective
    ) {
        partialParamsProvider.registerParams(name, value, bindValue, type);
    }
}