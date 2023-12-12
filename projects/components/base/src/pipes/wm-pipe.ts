
import { CustomPipeManager } from '@wm/core';
declare const _;

export class WmPipe {
    protected pipeRef;
    protected isCustomPipe;
    constructor(private pipeName, protected customPipeManager: CustomPipeManager) {
        this.pipeRef = this.customPipeManager ? this.customPipeManager.getCustomPipe(pipeName) : null;
        this.isCustomPipe = this.pipeRef && _.isFunction(this.pipeRef.formatter);
    }

    customFormatter(data, args) {
        try {
            return this.pipeRef.formatter(...args);
        } catch (error) {
            return data;
        }
    }
}