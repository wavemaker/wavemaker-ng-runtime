import { BaseAction } from '../base-action';
export declare class TimerAction extends BaseAction {
    private currentOptions;
    private repeating;
    private _isFired;
    constructor(variable: any);
    fire(options: any, success: any, error: any): any;
    invoke(options: any, success: any, error: any): any;
    cancel(): any;
    mute(): void;
    unmute(): void;
}
