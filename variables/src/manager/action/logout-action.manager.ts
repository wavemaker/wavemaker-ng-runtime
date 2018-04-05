import { BaseActionManager } from './base-action.manager';

export class LogoutActionManager extends BaseActionManager {
    logout(variable, options, success, error) {
        console.log('logging out now..');
    }
}