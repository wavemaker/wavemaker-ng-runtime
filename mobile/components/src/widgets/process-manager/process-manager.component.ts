import { Component, DoCheck, ElementRef } from '@angular/core';

import { provideAsWidgetRef } from '@wm/components';
import { addClass, removeAttr, setAttr } from '@wm/core';

declare const _;

export interface Process {
    max: number;
    min: number;
    name: string;
    onStop: () => void;
    progressLabel: string;
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

    public createInstance(name: string, min?: number, max?: number): Promise<ProcessApi> {
        const instance: Process = {
            max: max || 100,
            min: min || 0,
            name: name,
            onStop: null,
            progressLabel: '',
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

    public ngDoCheck() {
        if (this.isVisible && this.instances.length === 0) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        } else if (!this.isVisible && this.instances.length > 0){
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
    }

}
