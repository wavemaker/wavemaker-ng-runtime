import {StaticVariable} from '../staticvariable/staticvariable';
// import {externalServices} from '../../../services/externalservices';
import {NavigationVariableService} from './navigationvariable.service';

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
