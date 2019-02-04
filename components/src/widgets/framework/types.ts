import { InjectionToken } from '@angular/core';

import { BaseComponent } from '../common/base/base.component';

export interface IWidgetConfig {
    widgetType: string;
    widgetSubType?: string;
    hostClass?: string;
    displayType?: string;
}

export interface IRedrawableComponent {
    redraw: Function;
}

export type ChangeListener = (key: string, nv: any, ov?: any) => void;

export abstract class WidgetRef {}

export abstract class DialogRef<T extends BaseComponent> {
    bsModal: any;
}

export const Context = new InjectionToken('Context Provider Reference');

export interface IDialog {
    open: (initState?: any) => void;
    close: () => void;
}