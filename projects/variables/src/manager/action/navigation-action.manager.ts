import * as NVUtils from '../../util/action/navigation-action.utils';
import { BaseActionManager } from './base-action.manager';

export class NavigationActionManager extends BaseActionManager {

    invoke(variable, options) {
        NVUtils.navigate(variable, options);
    }
}
