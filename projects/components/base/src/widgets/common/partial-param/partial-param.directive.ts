import { Attribute, Directive, Inject, Self, Input, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { $watch } from '@wm/core';

import { WidgetRef } from '../../../widgets/framework/types';

declare const _;

@Directive({
    selector: '[partialContainer]',
})
export class PartialParamHandlerDirective {
    constructor (@Self() @Inject(WidgetRef) private widgetRef) {
        this.widgetRef.partialParams = {};
        this.widgetRef.pageParams = this.widgetRef.partialParams;
        this.widgetRef.params$ = new Subject();
    }

    registerParams(name: string, value: string, bindExpr: string, type: string) {
        this.widgetRef.partialParams[name] = value;
        if (!value && bindExpr) {
            this.widgetRef.registerDestroyListener(
                $watch(bindExpr, this.widgetRef.getViewParent(), _.get(this.widgetRef, 'context'), nv => {
                    this.widgetRef.partialParams[name] = nv;

                    // notify the partial container of the param changes
                    this.widgetRef.params$.next();
                })
            );
        } else {
            this.widgetRef.params$.next();
        }

    }
}

@Directive({
    selector: '[wmParam]',
})
export class PartialParamDirective implements OnInit {

    @Input() name: string;
    @Input() value: any;

    constructor(
        @Attribute('value.bind') public bindValue,
        @Attribute('type') public type,
        private partialParamsProvider: PartialParamHandlerDirective
    ) {
    }

    ngOnInit() {
        this.partialParamsProvider.registerParams(this.name, this.value, this.bindValue, this.type);
    }
}
