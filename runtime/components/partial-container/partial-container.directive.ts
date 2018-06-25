import { Attribute, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';
import { noop } from '@wm/core';

import { RenderUtilsService } from '../../services/render-utils.service';

declare const _;

@Directive({
    selector: '[partialContainer][content]:not([content="inline"]), [partialContainer][content.bind]'
})
export class PartialContainerDirective {

    private contentInitialized = false;

    get name() {
        return this.componentInstance.name;
    }

    renderPartial(nv, vcRef, componentInstance) {
        this.vcRef.clear();

        const $target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;

        $target.innerHTML = '';

        this.contentInitialized = true;

        return this.renderUtils.renderPartial(
            nv,
            vcRef,
            $target,
            componentInstance,
            () => (this.inj as any).view.component._resolveFragment()
        );
    }

    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
    }

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public renderUtils: RenderUtilsService,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector,
        @Attribute('content') _content: string
    ) {

        if (_content) {
            (this.inj as any).view.component._registerFragment();
        }

        componentInstance.registerPropertyChangeListener((key: string, nv: any, ov?: any) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderPartial(nv, vcRef, componentInstance)
                            .then(() => this.onLoadSuccess());
                        componentInstance.$lazyLoad = noop;
                    };
                } else {
                    this.renderPartial(nv, vcRef, componentInstance)
                        .then(() => this.onLoadSuccess());
                }
            }
        });

        const subscription = componentInstance.params$.debounceTime(200).subscribe(() => {
            if (this.contentInitialized) {
                this.renderPartial(componentInstance.content, vcRef, componentInstance)
                    .then(() => this.onLoadSuccess());
            }
        });
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(() => subscription.unsubscribe());
    }
}