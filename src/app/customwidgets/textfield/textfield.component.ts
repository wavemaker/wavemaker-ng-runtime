import { Component, Injector, Optional, ViewEncapsulation } from '@angular/core';

import { UserDefinedExecutionContext } from '@wm/core';

import { initScript } from './textfield.component.script';
import { getVariables } from './textfield.component.variables';
import { BaseCustomWidgetComponent } from '../../../../projects/runtime-base/src/components/base-custom-widget.component';
import { RuntimeBaseModule } from '../../../../projects/runtime-base/src/runtime-base.module';
import { FormsModule as ngFormsModule } from '@angular/forms';
import { BasicModule as WM_BasicModule } from '@wm/components/basic';
//import { ProgressModule as WM_ProgressModule } from '@wm/components/basic/progress';
import { InputModule as WM_InputModule } from '@wm/components/input';

@Component({
    standalone: true,
    selector: 'app-custom-textfield',
    templateUrl: './textfield.component.html',
    styleUrls: ['./textfield.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [ RuntimeBaseModule, ngFormsModule,
	WM_BasicModule,
	//WM_ProgressModule,
	WM_InputModule],
    providers: [
        {
            provide: UserDefinedExecutionContext,
            useExisting: TextfieldComponent
        }
    ]
})
export class TextfieldComponent extends BaseCustomWidgetComponent { 

    override customWidgetName = 'textfield';
    [key: string]: any;
    

    constructor() {
        super();
        super.init();
    }

    getVariables() {
        return getVariables();
    }

    evalUserScript(Widget, App, Utils) {
        initScript(Widget, App, Utils);
    }
}
