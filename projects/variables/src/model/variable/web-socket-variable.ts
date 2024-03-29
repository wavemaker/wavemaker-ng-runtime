import { ApiAwareVariable } from '@wavemaker/variables';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET);
};

export class WebSocketVariable extends ApiAwareVariable {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    open(success?, error?) {
        return getManager().open(this, success, error);
    }

    close () {
        return getManager().close(this);
    }

    update() {
        return getManager().update(this);
    }

    send(message?: string) {
        return getManager().send(this, message);
    }

    cancel() {
        return this.close();
    }

    invoke(options?, success?, error?) {
        this.open(success, error);
    }

    init () {
        getManager().initBinding(this);
    }
}
