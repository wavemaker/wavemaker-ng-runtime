import { StaticVariable } from '../static-variable/static-variable';
import * as NVUtils from './navigation-variable.util';

export class NavigationVariable extends StaticVariable {
    operation: string;
    pageName: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
    }

    invoke() {
        NVUtils.navigate(this.dataBinding.pageName, this.dataSet);
    }
}
