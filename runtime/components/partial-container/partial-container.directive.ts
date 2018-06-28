import { Attribute, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';
import { $invokeWatchers, noop } from '@wm/core';

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

    _renderPartial(nv) {
        this.vcRef.clear();

        const $target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;

        $target.innerHTML = '';

        $invokeWatchers(true);

        return this.renderUtils.renderPartial(
            nv,
            this.vcRef,
            $target,
            this.componentInstance,
            () => (this.inj as any).view.component._resolveFragment()
        ).then(() => {
            this.contentInitialized = true;
            this.onLoadSuccess();
        });
    }

    renderPartial = _.debounce(this._renderPartial, 200);

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

        componentInstance.registerPropertyChangeListener((key: string, nv: any, ov?: any) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    (this.inj as any).view.component._registerFragment();
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
            .filter(() => this.contentInitialized)
            .debounceTime(200).subscribe(() => this.renderPartial(componentInstance.content));
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(() => subscription.unsubscribe());
    }
}