import { Attribute, Directive, Inject, Self, Input, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import { $watch } from '@wm/core';
import { WidgetRef } from '@wm/components/base';


declare const _;

@Directive({
    selector: '[customWidgetContainer]',
})
export class CustomWidgetPropHandlerDirective {
    constructor (@Self() @Inject(WidgetRef) private widgetRef) {
        this.widgetRef.props = {};
        this.widgetRef.pageParams = this.widgetRef.props;
        this.widgetRef.params$ = new Subject();
    }

    registerParams(name: string, value: string, bindExpr: string, type: string) {
        this.widgetRef.props[name] = value;
        console.log(name + ": " + value+ ":" + bindExpr);
        if (!value && bindExpr) {
            this.widgetRef.registerDestroyListener(
                //[Todo-CSP]: expr fn should be generated be default
                $watch(bindExpr, this.widgetRef.getViewParent(), _.get(this.widgetRef, 'context'), nv => {
                    this.widgetRef.props[name] = nv;

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
    selector: '[wmProp]',
})
export class CustomWidgetPropDirective implements OnInit {

    @Input() name: string;
    @Input() value: any;

    constructor(
        @Attribute('value.bind') public bindValue,
        @Attribute('type') public type,
        private customWidgetPropsProvider: CustomWidgetPropHandlerDirective
    ) {
    }

    ngOnInit() {
        this.customWidgetPropsProvider.registerParams(this.name, this.value, this.bindValue, this.type);
    }
}
