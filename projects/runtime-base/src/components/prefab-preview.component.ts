import { AfterViewInit, Component, ViewChild } from '@angular/core';

import { PrefabDirective } from '@wm/components/prefab';

import { PrefabManagerService } from '../services/prefab-manager.service';

const PREFAB = 'PREFAB';

@Component({
    selector: 'wm-prefab-preview',
    template: `
        <div class="prefab-preview row">
            <section wmPrefab name="prefab-preview" prefabname="__self__"></section>
        </div>
    `
})
export class PrefabPreviewComponent implements AfterViewInit {
    private config: any;
    private previewMode: boolean;

    @ViewChild(PrefabDirective) prefabInstance;

    constructor(private prefabManager: PrefabManagerService) {

        window.addEventListener('message', e => {
            const context = e.data && e.data.context;

            if (context !== PREFAB) {
                return;
            }

            const action = e.data.action;
            const payload = e.data.payload;

            if (action === 'init') {
                this.init();
            } else if (action === 'set-property') {
                this.setProperty(payload);
            } else if (action === 'get-outbound-properties') {
                this.getOutboundProps();
            } else if (action === 'invoke-script') {
                this.invokeScript(payload);
            }
        });
    }

    postMessage(action, payload?: any) {
        const data = {
            context: PREFAB,
            action,
            payload
        };
        window.top.postMessage(data, '*');
    }

    setupEventListeners() {
        this.prefabInstance.invokeEventCallback = (eventName, locals = {}) => {
            this.postMessage('event-log', { name: eventName, data: locals });
        };
    }

    init() {
        this.previewMode = true;

        this.prefabInstance.readyState.subscribe(
            () => {},
            () => {},
            () => {
                this.prefabManager.getConfig('__self__')
                    .then(config => {
                        this.config = config;
                        this.postMessage('config', config);

                        this.setupEventListeners();
                    });
            }
        );
    }

    setProperty(payload: any) {
        this.prefabInstance.widget[payload.name] = payload.value;
    }

    isOutBoundProp(info) {
        return info.bindable === 'out-bound' || info.bindable === 'in-out-bound';
    }

    getOutboundProps() {
        const payload = {};
        for (const [name, info] of Object.entries(this.config.properties || {})) {
            if (this.isOutBoundProp(info)) {
                payload[name] = this.prefabInstance.widget[name];
            }
        }

        this.postMessage('outbound-properties', payload);
    }

    invokeScript(payload: any) {
        const script = `\n return ${payload.script};`;

        const fn = new Function('Prefab', script);

        const retVal = fn(this.prefabInstance);

        this.postMessage('method-output', { methodName: payload.methodName, output: retVal });
    }

    ngAfterViewInit() {
        this.setupEventListeners();
        this.postMessage('init');
    }
}

