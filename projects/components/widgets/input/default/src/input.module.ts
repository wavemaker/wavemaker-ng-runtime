import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IMaskModule } from 'angular-imask';

import { WmComponentsModule } from '@wm/components/base';

import { ButtonComponent } from './button/button.component';
import { ButtonGroupDirective } from './button-group/button-group.directive';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { CheckboxsetComponent } from './checkboxset/checkboxset.component';
import { CompositeDirective } from './composite/composite.directive';
import { NumberComponent } from './number/number.component';
import { RadiosetComponent } from './radioset/radioset.component';
import { SelectComponent } from './select/select.component';
import { SwitchComponent } from './switch/switch.component';
import { InputCalendarComponent } from './text/calendar/input-calendar.component';
import { InputColorComponent } from './text/color/input-color.component';
import { InputEmailComponent } from './text/email/input-email.component';
import { InputNumberComponent } from './text/number/input-number.component';
import { InputTextComponent } from './text/text/input-text.component';
import { TextareaComponent } from './textarea/textarea.component';
import { CaptionPositionDirective } from './caption-position.directive';

const components = [
    ButtonComponent,
    ButtonGroupDirective,
    CaptionPositionDirective,
    CheckboxComponent,
    CheckboxsetComponent,
    CompositeDirective,
    NumberComponent,
    RadiosetComponent,
    SelectComponent,
    SwitchComponent,
    InputCalendarComponent,
    InputColorComponent,
    InputEmailComponent,
    InputNumberComponent,
    InputTextComponent,
    TextareaComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        WmComponentsModule,
        IMaskModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class InputModule {
}
