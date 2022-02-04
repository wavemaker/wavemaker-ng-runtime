import {Component, ViewChild} from "@angular/core";
import {TextareaComponent} from "./textarea.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {FormsModule} from "@angular/forms";
import {App, AppDefaults} from "@wm/core";
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";

let mockApp = {};

const markup = `<wm-textarea name="textarea1" hint="textarea field">`;

@Component({
    template: markup
})

class TextareaWrapperComponent {
    @ViewChild(TextareaComponent, /* TODO: add static flag */ {static: true}) wmComponent: TextareaComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [TextareaWrapperComponent, TextareaComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-textarea',
    widgetSelector: '[wmTextarea]',
    testModuleDef: testModuleDef,
    testComponent: TextareaWrapperComponent,
    inputElementSelector: 'textarea'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
