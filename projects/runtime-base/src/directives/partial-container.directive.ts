import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { debounceTime, filter } from 'rxjs/operators';

import { App, $invokeWatchers, noop } from '@wm/core';

import { WidgetRef } from '@wm/components';

import { ComponentRefProvider, ComponentType, PartialRefProvider } from '../types/types';

declare const _;

@Directive({
    selector: '[partialContainer]'
})
export class PartialContainerDirective {

    private contentInitialized = false;
    private $target;

    get name() {
        return this.componentInstance.name;
    }

    async _renderPartial(nv) {
        // destroy the existing partial
        this.vcRef.clear();
        // when the container-target is inside the component template, it can be queried after viewInit of the component.
        $invokeWatchers(true);

        const componentFactory = await this.partialRefProvider.getComponentFactoryRef(nv, ComponentType.PARTIAL);
        if (componentFactory) {
            const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);

            if (!this.$target) {
                this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
            }

            this.$target.innerHTML = '';
            this.$target.appendChild(instanceRef.location.nativeElement);
            this.contentInitialized = true;
            setTimeout(() => this.onLoadSuccess(), 200);
        }
    }

    renderPartial = _.debounce(this._renderPartial, 200, {leading: true});

    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');

        this.app.notify('partialLoaded');
    }

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector,
        private app: App,
        @Attribute('content') _content: string,
        private resolver: ComponentFactoryResolver,
        private componentRefProvider: ComponentRefProvider,
        private partialRefProvider: PartialRefProvider
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
