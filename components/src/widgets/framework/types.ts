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

export abstract class AccordionRef {}

export abstract class FormRef {}

export abstract class MenuRef {}

export abstract class TableColumnGroupRef {}

export abstract class TableRef {}