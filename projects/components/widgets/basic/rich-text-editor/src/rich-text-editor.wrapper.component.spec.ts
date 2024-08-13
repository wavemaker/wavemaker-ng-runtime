import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { ComponentsTestModule } from '../../../../base/src/test/components.test.module';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { SanitizePipe } from "@wm/components/base";
import jQuery from "jquery";
import "summernote/dist/summernote-lite.min.js";
import { DomSanitizer } from '@angular/platform-browser';

const markup = `<div wmRichTextEditor #wm_richtexteditor1="wmRichTextEditor"
                        [attr.aria-label]="wm_richtexteditor1.hint || 'Help text for test richtext editor'"
                        hint="Help text for test richtext editor"
                        placeholder="test placeholder"
                        readonly="true" show="true" showpreview="true"
                        tabindex="1" class="text-success" name="richtexteditor1">
                </div>`;

@Component({
    template: markup
})
class RichTextEditorWrapperComponent {
    @ViewChild(RichTextEditorComponent, /* TODO: add static flag */ { static: true }) wmComponent: RichTextEditorComponent;
}

const testModuleDef: ITestModuleDef = {
    declarations: [RichTextEditorWrapperComponent, RichTextEditorComponent],
    imports: [ComponentsTestModule],
    providers: [
        { provide: SanitizePipe, useClass: SanitizePipe },
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

describe('wm-richtexteditor: Component Spectific Tests', () => {
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
        // Assert the value of code
        expect(wmComponent.$richTextEditor.summernote('code')).toEqual(testData);
    });

    it('should apply provided height for the editor', () => {
        const height = '300px';
        wmComponent.getWidget().height = height;
        fixture.detectChanges();
        const editorElement = wmComponent.$element.find('div.note-editable');
        const editorHeight = editorElement.prevObject[0].widget.height
        expect(editorHeight).toEqual(height);
    });

    describe('getDefaultOptions', () => {
        it('should return EDITOR_DEFAULT_OPTIONS', () => {
            expect(wmComponent.getDefaultOptions()).toEqual(wmComponent.EDITOR_DEFAULT_OPTIONS);
        });
    });

    describe('getLib', () => {
        it('should return "summernote"', () => {
            expect(wmComponent.getLib()).toBe('summernote');
        });
    });

    describe('overrideDefaults', () => {
        it('should override default options', () => {
            const newOptions = { placeholder: 'New placeholder' };
            wmComponent.overrideDefaults(newOptions);
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.placeholder).toBe('New placeholder');
        });
    });

    describe('getCurrentPosition', () => {
        it('should call performEditorOperation with "createRange"', () => {
            jest.spyOn(wmComponent, 'performEditorOperation');
            wmComponent.getCurrentPosition();
            expect(wmComponent.performEditorOperation).toHaveBeenCalledWith('createRange');
        });
    });

    describe('undo', () => {
        it('should call performEditorOperation with "undo"', () => {
            jest.spyOn(wmComponent, 'performEditorOperation');
            wmComponent.undo();
            expect(wmComponent.performEditorOperation).toHaveBeenCalledWith('undo');
        });
    });

    describe('focus', () => {
        it('should call performEditorOperation with "focus"', () => {
            jest.spyOn(wmComponent, 'performEditorOperation');
            wmComponent.focus();
            expect(wmComponent.performEditorOperation).toHaveBeenCalledWith('focus');
        });
    });

    describe('EDITOR_DEFAULT_OPTIONS', () => {
        it('should have correct toolbar options', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.toolbar).toContainEqual(['misc', ['undo', 'redo']]);
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.toolbar).toContainEqual(['style', ['style']]);
            // Add more assertions for other toolbar options
        });

        it('should have correct callbacks', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.callbacks).toHaveProperty('onInit');
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.callbacks).toHaveProperty('onChange');
        });

        it('should have correct font names', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.fontNames).toEqual([
                'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'
            ]);
        });

        it('should have correct placeholder', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.placeholder).toBe('write here...');
        });

        it('should have correct minHeight', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.minHeight).toBe(100);
        });

        it('should have disableResizeEditor set to true', () => {
            expect(wmComponent.EDITOR_DEFAULT_OPTIONS.disableResizeEditor).toBe(true);
        });
    });

    describe('callbacks', () => {
        describe('onInit', () => {
            it('should set isEditorLoaded to true', () => {
                wmComponent.EDITOR_DEFAULT_OPTIONS.callbacks.onInit();
                expect(wmComponent.isEditorLoaded).toBe(true);
            });

            it('should process operation stack if not empty', () => {
                wmComponent._operationStack = [
                    new Map([['key1', 'value1']]),
                    new Map([['key2', 'value2']])
                ];
                jest.spyOn(wmComponent, 'performEditorOperation');
                wmComponent.EDITOR_DEFAULT_OPTIONS.callbacks.onInit();
                expect(wmComponent.performEditorOperation).toHaveBeenCalledTimes(2);
                expect(wmComponent._operationStack).toEqual([]);
            });
        });

        describe('onChange', () => {
            let sanitizer: DomSanitizer;
            beforeEach(() => {
                sanitizer = TestBed.inject(DomSanitizer);
            });
            it('should update proxyModel and invoke onChange and onTouched', () => {
                const contents = '<p>Test content</p>';
                const sanitizedContent = '<p>Sanitized content</p>';
                jest.spyOn(sanitizer, 'sanitize').mockReturnValue(sanitizedContent);
                jest.spyOn(wmComponent, 'invokeOnChange');
                jest.spyOn(wmComponent, 'invokeOnTouched');

                wmComponent.EDITOR_DEFAULT_OPTIONS.callbacks.onChange(contents, true);

                expect(wmComponent.proxyModel).toBe(sanitizedContent);
                expect(wmComponent.invokeOnChange).toHaveBeenCalledWith(contents, expect.any(Object), true);
                expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
            });
        });
    });
});
