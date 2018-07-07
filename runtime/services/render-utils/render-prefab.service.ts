import { Injectable, ViewContainerRef } from '@angular/core';

import { transpile } from '@wm/transpiler';
import { noop } from '@wm/core';
import { BaseComponent } from '@wm/components';

import { RenderFragmentService } from './render-fragment.service';
import { RenderViewService } from './render-view.service';

@Injectable()
export class RenderPrefabService {
    constructor(
        private renderFragment: RenderFragmentService,
        private renderResource: RenderViewService
    ) {

    }

    public renderForPreview(vcRef: ViewContainerRef, $target: HTMLElement) {
        return this.renderResource.render(
            `app-prefab-self`,
            transpile(`<wm-prefab name="prefab-preview" prefabname="__self__"></wm-prefab>`),
            '',
            undefined,
            noop,
            vcRef,
            $target
        );
    }

    public async render(prefabName: string, config: any, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: BaseComponent) {
        const context = 'Partial';

        return Promise.resolve();

        // return this.renderFragment.render(
        //     prefabName,
        //     getFragmentUrl(prefabName),
        //     context,
        //     `app-partial-${prefabName}`,
        //     (instance: any) => {
        //         this.componentInitFn(instance, containerWidget);
        //     },
        //     vcRef,
        //     $target,
        //     true
        // ).then(({instance, variableCollection}) => {
        //     this.postReady(instance, variableCollection);
        // });
    }

}