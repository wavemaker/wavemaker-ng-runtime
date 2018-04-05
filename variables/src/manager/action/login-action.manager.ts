import { BaseActionManager } from './base-action.manager';

export class LoginActionManager extends BaseActionManager {
    login(variable, options, success, error) {
        console.log('logging in now..');
    }
}