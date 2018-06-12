import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './rich-text-editor.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const WIDGET_INFO = {widgetType: 'wm-richtexteditor', hostClass: 'app-richtexteditor clearfix'};

registerProps();

const getChangeEvt = () => {
    let changeEvt;
    // for IE the event constructor doesn't work so use the createEvent proto
    if (typeof(Event) === 'function') {
        changeEvt = new Event('change');
    } else {
        changeEvt = document.createEvent('Event');
        changeEvt.initEvent('change', true, true);
    }
    return changeEvt;
};

declare const _, $;

@Component({
    selector: 'div[wmRichTextEditor]',
    templateUrl: './rich-text-editor.component.html',
    providers: [
        provideAsNgValueAccessor(RichTextEditorComponent),
        provideAsWidgetRef(RichTextEditorComponent)
    ]
})
export class RichTextEditorComponent extends BaseFormCustomComponent implements OnInit, OnDestroy {

    $richTextEditor;
    $hiddenInputEle;

    _model_;
    _operationStack = [];
    isEditorLoaded = false;

    EDITOR_DEFAULT_OPTIONS = {
        toolbar: [
            // [groupName, [list of button]]
            ['misc', ['undo', 'redo']],
            ['style', ['style']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['height', ['height']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['color', ['color']],
            ['insert', ['table', 'picture', 'link', 'video', 'hr']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['misc', ['codeview', 'fullscreen', 'help']]
        ],
        callbacks: {
            onInit: () => {
                this.isEditorLoaded = true;
                if (this._operationStack.length) {
                    this._operationStack.forEach(operationParam => {
                        const key = Array.from(operationParam.keys())[0],
                            val = operationParam.get(key);
                        this.performEditorOperation(key, val);
                    });
                    this._operationStack = [];
                }
            },
            onChange: (contents, editable) => {
                this._model_ = this.domSanitizer.bypassSecurityTrustHtml(contents.toString());
                this.invokeOnChange(contents, getChangeEvt());
                this.invokeOnTouched();
            }
        },
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'],
        placeholder: '',
        height: 100,
        disableResizeEditor: true
    };

    get htmlcontent() {
        return this.performEditorOperation('code');
    }

    get datavalue() {
        return this.htmlcontent;
    }

    set datavalue(nv) {
        this.$hiddenInputEle.val(nv);
        this.performEditorOperation('reset');
        this.performEditorOperation('insertText', nv);
    }

    constructor(inj: Injector, private domSanitizer: DomSanitizer) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
    }

    ngOnInit() {
        super.ngOnInit();
        this.$richTextEditor = $(this.nativeElement.querySelector('[richTextEditor]'));
        this.$hiddenInputEle = $(this.nativeElement.querySelector('input.model-holder.ng-hide'));
        this.initEditor();
    }

    initEditor() {
        this.$richTextEditor.summernote(this.EDITOR_DEFAULT_OPTIONS);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'placeholder':
                this.EDITOR_DEFAULT_OPTIONS.placeholder = nv;
                this.performEditorOperation({
                    placeholder: nv
                });
                break;
            case 'disabled':
            case 'readonly':
                this.performEditorOperation(nv ? 'disable' : 'enable');
                break;
        }
    }

    onStyleChange(key, nv, ov) {
        if (key === 'height') {
            this.EDITOR_DEFAULT_OPTIONS.height = nv;
            this.performEditorOperation({
                height: nv
            });
        }
    }

    performEditorOperation(key, value?) {
        if (this.isEditorLoaded) {
            return this.$richTextEditor.summernote(key, value);
        } else {
            const op: any = new Map();
            op.set(key, value);
            this._operationStack.push(op);
            return;
        }
    }

    getCurrentPosition() {
        return this.performEditorOperation('createRange');
    }

    undo() {
        this.performEditorOperation('undo');
    }

    focus() {
        this.performEditorOperation('focus');
    }

    ngOnDestroy() {
        this.performEditorOperation('destroy');
        super.ngOnDestroy();
    }
}
