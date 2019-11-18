import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { ComponentsTestModule } from '../../../test/components.test.module';
import { compileTestComponent } from '../../../test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../test/common-widget.specs';

const  markup = `<div wmRichTextEditor role="textbox" name="richtexteditor1" showpreview="false"></div>`;

@Component({
    template: markup
})
class RichTextEditorWrapperComponent {
    @ViewChild(RichTextEditorComponent) wmComponent: RichTextEditorComponent;
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
// const testBase: ComponentTestBase = new ComponentTestBase(componentDef);

// testBase.verifyPropsInitialization();
// testBase.verifyCommonProperties();
// testBase.verifyStyles();

describe('component Spectific Tests',  () => {
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
        expect(wmComponent.$element.find('.note-editable b').css('font-weight')).toEqual('700');
    });
});
