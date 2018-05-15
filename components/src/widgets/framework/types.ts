import { BaseComponent } from '../common/base/base.component';
import { FormGroup } from '@angular/forms';

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

export abstract class MenuRef {}

export abstract class TableColumnGroupRef {}

export abstract class TableRef {}

export abstract class DialogRef<T extends BaseComponent> {}

export interface IDialog {
    open: () => void;
    close: () => void;
}