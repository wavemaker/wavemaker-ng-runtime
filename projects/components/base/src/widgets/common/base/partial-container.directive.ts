import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { debounceTime, filter } from 'rxjs/operators';

import { App, $invokeWatchers, noop, ComponentType, PartialRefProvider } from '@wm/core';

import { WidgetRef } from "../../framework/types";
import {debounce} from "lodash-es";

@Directive({
  standalone: true,
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
        // for partials with popovers and page dialogs which are inside a prefab, prefab name needs to be computed and appended
        const prefab = $(this.elRef.nativeElement).closest('.app-prefab');
        let prefabName;
        if (prefab.length) {
            prefabName = prefab.attr('prefabname');
        } else if (this.componentInstance.viewParent) {
            prefabName = this.componentInstance.viewParent.prefabName;
        }

        const componentFactory = await this.partialRefProvider.getComponentFactoryRef(nv, ComponentType.PARTIAL, {prefab: prefabName});
        if (componentFactory) {
            const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
            if (instanceRef && instanceRef['instance'] && prefabName) {
                // @ts-ignore
                instanceRef['instance'].prefabName = prefabName;
            }
            if (!this.$target) {
                this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
            }

            this.$target.innerHTML = '';
            this.$target.appendChild(instanceRef.location.nativeElement);
            this.contentInitialized = true;
            setTimeout(() => this.onLoadSuccess(), 200);
        }
    }

    renderPartial = debounce(this._renderPartial, 200);

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
