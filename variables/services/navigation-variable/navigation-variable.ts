import { StaticVariable } from '../static-variable/static-variable';
// import {externalServices} from '../../../services/externalservices';
import { NavigationVariableService } from './navigation-variable.service';

export class NavigationVariable extends StaticVariable {
    operation: string;
    pageName: string;

    constructor(variable: any, private navigationVariableService: NavigationVariableService) {
        super(variable);
        Object.assign(this, variable);
    }

    navigate() {
        console.log('Imma navigate soon. Trust me');
        this.navigationVariableService.navigate(this.dataBinding.pageName);
    }

    invoke() {
        this.navigate();
    }
}
