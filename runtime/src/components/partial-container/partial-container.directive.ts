import { Attribute, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { debounceTime, filter } from 'rxjs/operators';

import { WidgetRef } from '@wm/components';
import { $invokeWatchers, noop } from '@wm/core';

import { PartialRenderer } from '../../services/render-utils/partial-renderer';

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
        // destroy the existing partial
        this.vcRef.clear();
        // when the container-target is inside the component template, it can be queried after viewInit of the component.
        setTimeout(() => {
            this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
            $invokeWatchers(true);
            return this.partialRenderer.render(
                nv,
                this.vcRef,
                this.$target,
                this.componentInstance,
                this.inj
            ).then(() => {
                this.contentInitialized = true;
                this.onLoadSuccess();
            });
        });
    }

    renderPartial = _.debounce(this._renderPartial, 200);

    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
    }

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public partialRenderer: PartialRenderer,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector,
        @Attribute('content') _content: string
    ) {

        this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;

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