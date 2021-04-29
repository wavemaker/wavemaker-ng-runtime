import { Directive, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './repeat-template.props';
import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';

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

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
