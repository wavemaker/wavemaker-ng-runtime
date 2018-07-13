import { ApiAwareVariable } from './api-aware-variable';
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

    open() {
        return getManager().open(this);
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

    invoke() {
        this.open();
    }

    init () {
        getManager().initBinding(this);
    }
}