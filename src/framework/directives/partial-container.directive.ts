import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { $invokeWatchers, noop } from '@wm/core';

import { WidgetRef } from '@wm/components';
import { debounceTime, filter } from 'rxjs/operators';
import { getPartialComponentRef } from '../util/page-util';

declare const _;

@Directive({
    selector: '[partialContainer][content]:not([content="inline"]), [partialContainer][content.bind]'
})
export class PartialContainerDirective {

    private contentInitialized = false;
    private $target;

    get name() {
        return this.componentInstance.name;
    }

    _renderPartial(nv) {
        // when the container-target is inside the component template, it can be queried after viewInit of the component.
        $invokeWatchers(true);

        const componentRef = getPartialComponentRef(nv);
        const componentFactory = this.resolver.resolveComponentFactory(componentRef);
        const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);

        this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;

        this.$target.appendChild(instanceRef.location.nativeElement);

        this.contentInitialized = true;
        this.onLoadSuccess();
    }

    renderPartial = _.debounce(this._renderPartial, 200, {leading: true});

    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
    }

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector,
        @Attribute('content') _content: string,
        private resolver: ComponentFactoryResolver
    ) {

        componentInstance.registerPropertyChangeListener((key: string, nv: any, ov?: any) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderPartial(nv);
                        componentInstance.$lazyLoad = noop;
                    };
                } else {
                    this.renderPartial(nv);
                }
            }
        });

        const subscription = componentInstance.params$
            .pipe(
                filter(() => this.contentInitialized),
                debounceTime(200)
            )
            .subscribe(() => this.renderPartial(componentInstance.content));
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(() => subscription.unsubscribe());
    }
}
