import { Injectable, Injector, ViewContainerRef } from '@angular/core';

import { $invokeWatchers, App, noop } from '@wm/core';

import { commonPageWidgets, getFragmentUrl, RenderFragmentService } from './render-fragment.service';

@Injectable()
export class RenderPartialService {
    constructor(
        private renderFragment: RenderFragmentService,
        private app: App
    ) {}

    private registerWidgets(instance: any, containerWidget: any) {
        instance.Widgets = Object.create(commonPageWidgets);
        containerWidget.Widgets = instance.Widgets;
    }

    private registerVariables(instance: any, containerWidget: any) {
        containerWidget.Variables = instance.Variables;
        containerWidget.Actions = instance.Actions;
    }

    private registerPageParams(instance: any, containerWidget: any) {
        instance.pageParams = containerWidget.partialParams;
    }

    private componentInitFn(instance: any, containerWidget: any) {
        this.registerWidgets(instance, containerWidget);

        this.registerVariables(instance, containerWidget);

        instance.App = this.app;
        instance.activePageName = this.app.activePageName;

        this.registerPageParams(instance, containerWidget);
    }

    private invokeVariables(variableCollection: any) {
        variableCollection.callback(variableCollection.Variables);
        variableCollection.callback(variableCollection.Actions);
    }

    private invokeOnReady(instance: any, inj: Injector) {
        (instance.onReady || noop)();
        (inj as any).view.component._resolveFragment();
    }

    private postReady(instance: any, variableCollection: any, inj: Injector) {
        // TODO: have to make sure, the widgets are ready with default values, before firing onReady call
        $invokeWatchers(true);

        this.invokeVariables(variableCollection);

        this.invokeOnReady(instance, inj);
    }

    public async render(partialName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: any, inj: Injector) {
        const context = 'Partial';

        (inj as any).view.component._registerFragment();

        return this.renderFragment.render(
            partialName,
            getFragmentUrl(partialName),
            context,
            `app-partial-${partialName}`,
            (instance: any) => {
                this.componentInitFn(instance, containerWidget);
            },
            vcRef,
            $target,
            true
        ).then(({instance, variableCollection}) => {
            this.postReady(instance, variableCollection, inj);
        });
    }
}