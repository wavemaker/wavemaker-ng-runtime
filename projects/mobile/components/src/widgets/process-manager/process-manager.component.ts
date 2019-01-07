import { Component, DoCheck, ElementRef } from '@angular/core';

import { addClass, removeAttr, setAttr } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components';

declare const _;

export interface Process {
    max: number;
    min: number;
    name: string;
    onStop: () => void;
    progressLabel: string;
    show: boolean;
    stopButtonLabel: string;
    value: number;
}

export interface ProcessApi {
    destroy: () => Promise<void>;
    get: (propertyName: string) => string;
    set: (propertyName: string, propertyValue: any) => void;
}

const MAX_PROCESS = 3;

@Component({
    selector: '[wmProcessManager]',
    templateUrl: './process-manager.component.html',
    providers: [
        provideAsWidgetRef(ProcessManagerComponent)
    ]
})
export class ProcessManagerComponent implements DoCheck {

    private isVisible = true;

    public instances: Process[] = [];
    public queue = [];

    constructor(private el: ElementRef) {
        addClass(this.el.nativeElement, 'app-global-progress-bar modal default');
    }

    public createInstance(name: string, min = 0, max = 100): Promise<ProcessApi> {
        const instance: Process = {
            max: max,
            min: min,
            name: name,
            onStop: null,
            progressLabel: '',
            show: min !== max,
            stopButtonLabel : 'Cancel',
            value: 0
        };
        const api = {
            get: (propertyName) => instance[propertyName],
            set: (propertyName, propertyValue) => this.setInstaceProperty(instance, propertyName, propertyValue),
            destroy: () => this.removeInstance(instance)
        };
        return this.addToQueue(instance).then(() => api);
    }

    public getVisibleInstances() {
        return this.instances.filter(i => i.show);
    }

    public ngDoCheck() {
        const hasInstancesToShow = !!this.instances.find(i => i.show);
        if (this.isVisible && !hasInstancesToShow) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        } else if (!this.isVisible && hasInstancesToShow) {
            removeAttr(this.el.nativeElement, 'hidden');
            this.isVisible = true;
        }
    }

    private addToQueue(instance): Promise<void> {
        return new Promise( resolve => {
            this.queue.push(() => {
                if (this.instances.length < MAX_PROCESS) {
                    this.instances.push(instance);
                    resolve(instance);
                } else {
                    return false;
                }
            });
            this.flushQueue();
        });
    }

    private flushQueue() {
        if (this.queue.length > 0 && this.queue[0]() !== false) {
            this.queue.shift();
            this.flushQueue();
        }
    }

    private removeInstance(instance: Process): Promise<void> {
        return new Promise( resolve => {
            setTimeout(() => {
                _.remove(this.instances, instance);
                this.flushQueue();
                resolve();
            }, 1000);
        });
    }

    private setInstaceProperty(instance: Process, propertyName: string, propertyValue: any) {
        if (propertyName === 'value') {
            if (instance.value >= instance.max) {
                propertyValue = instance.max;
            }
            instance.value = propertyValue;
            instance.progressLabel = instance.value + '/' + instance.max;
        } else if (propertyName === 'onStop' && _.isFunction(propertyValue)) {
            instance.onStop = () => {
                propertyValue();
                return this.removeInstance(instance);
            };
        } else {
            instance[propertyName] = propertyValue;
        }
        instance.show = instance.min !== instance.max;
    }
}
