export interface IWidgetConfig {
    widgetType: string;
    widgetSubType?: string;
    hostClass?: string;
    [k: string]: any;
}

export type ChangeListener = (key: string, nv: any, ov?: any) => void;