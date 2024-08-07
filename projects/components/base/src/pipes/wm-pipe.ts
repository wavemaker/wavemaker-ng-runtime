
import { CustomPipeManager } from '@wm/core';
import {isFunction} from "lodash-es";

export class WmPipe {
    protected pipeRef;
    protected isCustomPipe;
    constructor(private pipeName, protected customPipeManager: CustomPipeManager) {
        this.pipeRef = this.customPipeManager ? this.customPipeManager.getCustomPipe(pipeName) : null;
        this.isCustomPipe = this.pipeRef && isFunction(this.pipeRef.formatter);
    }

    customFormatter(data, args) {
        try {
            return this.pipeRef.formatter(...args);
        } catch (error) {
            return data;
        }
    }
}
