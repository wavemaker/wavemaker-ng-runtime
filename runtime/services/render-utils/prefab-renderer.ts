import { Injectable, ViewContainerRef } from '@angular/core';

import { transpile } from '@wm/transpiler';
import { App, noop } from '@wm/core';
import { BaseComponent } from '@wm/components';

import { FragmentRenderer } from './fragment-renderer';
import { ViewRenderer } from './view-renderer';
import { PrefabManagerService } from '../prefab-manager.service';

declare const _;

@Injectable()
export class PrefabRenderer {
    constructor(
        private renderFragment: FragmentRenderer,
        private renderResource: ViewRenderer,
        private prefabMngr: PrefabManagerService,
        private app: App
    ) {}

    public async renderForPreview(vcRef: ViewContainerRef, $target: HTMLElement) {
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

    private registerWidgets(instance: any) {
        instance.Widgets = {};
    }

    private registerChangeListeners(instance: any, containerWidget: any) {
        if (_.isFunction(instance.onPropertyChange)) {
            containerWidget.registerPropertyChangeListener(instance.onPropertyChange);
            containerWidget.registerStyleChangeListener(instance.onPropertyChange);
        }

        instance.registerDestroyListener(() => containerWidget.invokeEventCallback('destroy'));
    }

    private registerProps(prefabName: string, instance: any, containerWidget: any) {
        this.prefabMngr.getConfig(prefabName)
            .then(config => {
                containerWidget.setProps(config);
                if (config) {
                    Object.entries((config.properties || {}))
                        .forEach(([key, prop]) => {
                            if (prop.type === 'event') {
                                instance[key] = (locals: any) => {
                                    const eventName = key.substr(2).toLowerCase();
                                    containerWidget.invokeEventCallback(eventName, (locals || {}));
                                };
                            } else if (prop.type === 'method') {
                                containerWidget[key] = (...args) => {
                                    try {
                                        instance[prop.method](...args);
                                    } catch (e) {
                                        console.warn(`error in executing prefab-${prefabName} method-${key}`);
                                    }
                                };
                            } else {
                                Object.defineProperty(instance, key, {
                                    get: () => {
                                        return containerWidget[key];
                                    },
                                    set: nv => {
                                        containerWidget.widget[key] = nv;
                                    }
                                });
                            }
                        });
                }
            });
    }

    private componentInitFn(prefabName: string, instance: any, containerWidget: any) {
        this.registerWidgets(instance);
        this.registerChangeListeners(instance, containerWidget);
        this.registerProps(prefabName, instance, containerWidget);
        instance.App = this.app;
        // prefabName is required on instance only when it is in being run in the app
        if (!this.prefabMngr.isPrefabInPreview(prefabName)) {
            instance.prefabName = prefabName;
        }
    }

    private invokeVariables(variableCollection: any) {
        variableCollection.callback(variableCollection.Variables);
        variableCollection.callback(variableCollection.Actions);
    }

    private invokeOnReady(instance: any, containerWidget: any) {
        (instance.onReady || noop)();
        containerWidget.invokeEventCallback('load');
    }

    private postReady(instance: any, containerWidget: any, variableCollection: any) {
        this.invokeVariables(variableCollection);
        this.invokeOnReady(instance, containerWidget);
    }

    public async render(prefabName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: BaseComponent) {
        const context = 'Prefab';

        return this.prefabMngr.loadDependencies(prefabName)
            .then(() => {
                return this.renderFragment.render(
                    prefabName,
                    this.prefabMngr.getPrefabMinJsonUrl(prefabName),
                    context,
                    `app-prefab-${prefabName}`,
                    (instance: any) => {
                        this.componentInitFn(prefabName, instance, containerWidget);
                    },
                    vcRef,
                    $target,
                    false
                ).then(({instance, variableCollection}) => {
                    this.postReady(instance, containerWidget, variableCollection);
                });
            });
    }

}