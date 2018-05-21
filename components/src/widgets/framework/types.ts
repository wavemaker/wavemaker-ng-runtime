import { InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';

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

export abstract class FormRef {
    ngform: FormGroup;
}

export abstract class LiveTableRef {
    onFormReady: Function;
    isLayoutDialog: boolean;
}

export abstract class MenuRef {}

export abstract class TableColumnGroupRef {}

export abstract class TableRef {}

export abstract class DialogRef<T extends BaseComponent> {}

export const Context = new InjectionToken('Context Provider Reference');

export interface IDialog {
    open: () => void;
    close: () => void;
}