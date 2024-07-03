import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { App, $invokeWatchers, noop, ComponentType, CustomRefProvider } from '@wm/core';
import { WidgetRef } from "../../framework/types";


declare const _;

@Directive({
    selector: '[customContainer]'
})
export class CustomContainerDirective {
    private contentInitialized = false;
    private $target;

    async _renderCustom(widgetName) {
        // destroy the existing partial
        this.vcRef.clear();

        // when the container-target is inside the component template, it can be queried after viewInit of the component.
        $invokeWatchers(true);

        const componentFactory = await this.customRefProvider.getComponentFactoryRef(widgetName, ComponentType.CUSTOM);

        if (componentFactory) {
            const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
            // if (instanceRef && instanceRef['instance'] && prefabName) {
            //     // @ts-ignore
            //     instanceRef['instance'].prefabName = prefabName;
            // }
            if (!this.$target) {
                // this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
                this.$target = this.elRef.nativeElement;
            }

            this.$target.innerHTML = '';
            this.$target.appendChild(instanceRef.location.nativeElement);
            this.contentInitialized = true;
            setTimeout(() => this.onLoadSuccess(), 200);
        }
    }

    renderCustom = _.debounce(this._renderCustom, 200);

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
        @Attribute('widgetname') widgetname: string,
        private resolver: ComponentFactoryResolver,
        private customRefProvider: CustomRefProvider
    ) {
        componentInstance.registerPropertyChangeListener((key: string, nv: any, ov?: any) => {
            if (key === 'widgetname') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderCustom(nv);
                        componentInstance.$lazyLoad = noop;
                    };
                } else {
                    this.renderCustom(nv);
                }
            }
        });
    }
}