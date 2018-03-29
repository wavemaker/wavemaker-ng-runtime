import { ModelVariableManager } from './model-variable.manager';
import * as NVUtils from '../utils/navigation-variable.util';

export class NavigationVariableManager extends ModelVariableManager{

    invoke(variable) {
        NVUtils.navigate(variable.dataBinding.pageName, variable.dataSet);
    }

}