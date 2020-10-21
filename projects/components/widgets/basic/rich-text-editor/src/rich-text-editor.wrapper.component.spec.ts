import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { ComponentsTestModule } from '../../../../base/src/test/components.test.module';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';

const  markup = `<div wmRichTextEditor
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
    imports: [ComponentsTestModule]
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
    it('shoould display default value as text', () => {
        const testData = 'hello world';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        expect(wmComponent.performEditorOperation('code')).toEqual(testData);
    });
    it('shoould display default value as empty string', () => {
        const testData = '';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        expect(wmComponent.performEditorOperation('code')).toEqual(testData);
    });
    it('shoould display default value as html', () => {
        const testData = '<b>hello world</b>';
        wmComponent.datavalue = testData;
        fixture.detectChanges();
        expect(wmComponent.performEditorOperation('code')).toEqual(testData);
        expect(wmComponent.$element.find('div.note-editable b').css('font-weight')).toEqual('700');
    });
    it('should apply provided height for the editor', () => {
        const height = '300px';
        wmComponent.getWidget().height = height;
        fixture.detectChanges();
        expect(wmComponent.$element.find('div.note-editable').css('height')).toEqual(height);
    });
});
