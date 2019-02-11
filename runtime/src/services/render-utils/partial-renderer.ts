import { Injectable, Injector, ViewContainerRef } from '@angular/core';

import { $invokeWatchers, App, noop, triggerFn } from '@wm/core';

import { commonPageWidgets, getFragmentUrl, FragmentRenderer } from './fragment-renderer';

@Injectable()
export class PartialRenderer {
    constructor(
        private renderFragment: FragmentRenderer,
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

    private resolveFragment(inj: Injector) {
        triggerFn((inj as any).view.component._resolveFragment);
    }

    private invokeOnReady(instance: any, inj: Injector) {
        (instance.onReady || noop)();
        this.resolveFragment(inj);
    }

    private postReady(instance: any, variableCollection: any, inj: Injector) {
        this.invokeVariables(variableCollection);
        this.invokeOnReady(instance, inj);
    }

    public async render(partialName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: any, inj: Injector) {
        const context = 'Partial';

        triggerFn((inj as any).view.component._registerFragment);

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
            $invokeWatchers(true, true);
            this.postReady(instance, variableCollection, inj);
        }, () => {
            this.resolveFragment(inj);
        });
    }
}