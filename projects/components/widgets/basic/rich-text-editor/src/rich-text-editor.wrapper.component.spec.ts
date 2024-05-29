import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { ComponentsTestModule } from '../../../../base/src/test/components.test.module';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import {SanitizePipe} from "@wm/components/base";
import "summernote/dist/summernote-lite.min.js";

const  markup = `<div wmRichTextEditor #wm_richtexteditor1="wmRichTextEditor"
                        [attr.aria-label]="wm_richtexteditor1.hint || 'Help text for test richtext editor'"
                        hint="Help text for test richtext editor"
                        placeholder="test placeholder"
                        readonly="false" show="true" showpreview="false"
                        tabindex="1" class="text-success" name="richtexteditor1">
                </div>`;

@Component({
    template: markup
})
class RichTextEditorWrapperComponent {
    @ViewChild(RichTextEditorComponent, /* TODO: add static flag */ {static: true}) wmComponent: RichTextEditorComponent;
}

const testModuleDef: ITestModuleDef = {
    declarations: [RichTextEditorWrapperComponent, RichTextEditorComponent],
    imports: [ComponentsTestModule],
    providers: [
        {provide: SanitizePipe, useClass: SanitizePipe},
    ]
};
const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-richtexteditor',
    widgetSelector: '[wmRichTextEditor]',
    testModuleDef: testModuleDef,
    testComponent: RichTextEditorWrapperComponent
};
const testBase: ComponentTestBase = new ComponentTestBase(componentDef);
testBase.verifyPropsInitialization();
testBase.verifyCommonProperties();
testBase.verifyAccessibility();

describe('wm-richtexteditor: Component Spectific Tests',  () => {
    let fixture: ComponentFixture<RichTextEditorWrapperComponent>;
    let wrapperComponent: RichTextEditorWrapperComponent;
    let wmComponent: RichTextEditorComponent;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, RichTextEditorWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    });
    it('should create the Richtext Editor compoent', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    it('should display datavalue as undefined', () => {
        expect(wmComponent.datavalue).toBeUndefined();
    });
    it('should display default value as text', () => {
        const testData = 'hello world';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        expect(wmComponent.performEditorOperation('code')).toEqual(testData);
    });
    it('should display default value as empty string', () => {
        const testData = '';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        expect(wmComponent.performEditorOperation('code')).toEqual(testData);
    });
    it('should display default value as html', () => {
        const testData = '<b>hello world</b>';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        // Verify the editor's content directly
        const editorContent = wmComponent.$element.find('div.note-editable');
        // Find the codeMap from the _operationStack
        const codeMap = editorContent.prevObject[0].widget._operationStack.find((map) => map.has('code'));
        const codeValue = codeMap ? codeMap.get('code') : undefined;
        // Assert the value of code
        expect(codeValue).toEqual(testData);
    });

    it('should apply provided height for the editor', () => {
        const height = '300px';
        wmComponent.getWidget().height = height;
        fixture.detectChanges();
        const editorElement = wmComponent.$element.find('div.note-editable');
        const editorHeight = editorElement.prevObject[0].widget.height
        expect(editorHeight).toEqual(height);
    });
});
