import * as NVUtils from '../../util/action/navigation-action.utils';
import { BaseActionManager } from './base-action.manager';

export class NavigationActionManager extends BaseActionManager {

    invoke(variable) {
        NVUtils.navigate(variable.dataBinding.pageName || variable.pageName, variable.dataSet);
    }

}