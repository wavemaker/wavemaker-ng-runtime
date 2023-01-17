import {Directive, Injector, Optional} from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './repeat-template.props';
import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import {UserDefinedExecutionContext} from '@wm/core';

const DEFAULT_CLS = 'app-repeat-item';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-repeat-template',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmRepeatTemplate]'
})
export class RepeatTemplateDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
        styler(this.nativeElement, this);
    }
}
