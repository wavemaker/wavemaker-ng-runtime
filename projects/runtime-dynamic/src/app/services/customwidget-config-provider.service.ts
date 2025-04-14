import { Injectable } from '@angular/core';

import { CustomwidgetConfigProvider, CUSTOM_WIDGETS_BASE_FOLDER } from '@wm/runtime/base';

const cache = new Map<string, any>();
@Injectable()
export class CustomwidgetConfigProviderService extends CustomwidgetConfigProvider {

    constructor() {
        super();
    }

    public getConfig(widgetname: string): Promise<any> {
        return new Promise((res, rej) => {
            Promise.resolve(window['resourceCache'].get(`./custom-widgets/${CUSTOM_WIDGETS_BASE_FOLDER}/${widgetname}/page.min.json`)).then((pageInfo) => {
                res(pageInfo.config);
            });
        })
    }
}
