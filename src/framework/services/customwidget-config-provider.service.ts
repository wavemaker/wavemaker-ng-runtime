import { Injectable } from '@angular/core';

import { CustomwidgetConfigProvider } from '@wm/runtime/base';

import { getCustomWidgetConfig } from '../util/page-util';

@Injectable()
export class CustomwidgetConfigProviderService extends CustomwidgetConfigProvider {

    public getConfig(widgetname: string): Promise<any> {
        return Promise.resolve(getCustomWidgetConfig(widgetname));
    }
}
