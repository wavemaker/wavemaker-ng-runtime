import { Component, Injector, OnDestroy, OnInit } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './rich-text-editor.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const WIDGET_INFO = {widgetType: 'wm-richtexteditor', hostClass: 'app-richtexteditor clearfix'};

registerProps();

const getChangeEvt = () => {
    let changeEvt;
    // for IE the event constructor doesn't work so use the createEvent proto
    if (typeof(Event) === 'function') {
        changeEvt = new Event('change');
    } else{
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
        provideAsWidgetRef(RichTextEditorComponent)
    ]
})
export class RichTextEditorComponent extends StylableComponent implements OnInit, OnDestroy {

    $richTextEditor;
    $hiddenInputEle;
    showpreview: boolean;
    operationStack = [];
    isEditorLoaded = false;
    disabled = true;
    height;

    EDITOR_DEFAULT_OPTIONS = {
        toolbar: [
            // [groupName, [list of button]]
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['table', 'picture', 'link', 'video', 'hr']],
            ['misc', ['undo', 'redo', 'codeview', 'fullscreen', 'help']]
        ],
        callbacks: {
            onInit: () => {
                this.isEditorLoaded = true;
                if (this.operationStack.length) {
                    this.operationStack.forEach(operationParam => {
                        let key = Array.from(operationParam.keys())[0],
                            val = operationParam.get(key);
                        this.performEditorOperation(key, val);
                    });
                    this.operationStack = [];
                }
            },
            onChange: (contents, editable) => {
                this.$hiddenInputEle.val(contents);
                this.invokeEventCallback('change', {newVal: contents, $event: getChangeEvt()});
            }
        },
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

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
    }

    onPropertyChange(key, nv, ov?) {
        switch(key) {
            case 'placeholder':
                this.EDITOR_DEFAULT_OPTIONS.placeholder = nv;
                this.performEditorOperation({
                    placeholder: nv
                });
                break;
            case 'datavalue':
                this.$hiddenInputEle.val(nv);
                this.performEditorOperation('reset');
                this.performEditorOperation('inserText', nv);
                break;
            case 'showpreview':
                this.showpreview = nv;
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
        if (!this.isEditorLoaded) {
            let op: any = new Map();
            op.set(key, value);
            this.operationStack.push(op);
            return;
        }
        return this.$richTextEditor.summernote(key, value);
    }

    getCurrentPosition() {
        return this.performEditorOperation('createRange');
    }

    initEditor() {
        this.$richTextEditor.summernote(this.EDITOR_DEFAULT_OPTIONS);
    }

    undo() {
        this.performEditorOperation('undo');
    }

    focus() {
        this.performEditorOperation('focus');
    }

    ngOnInit() {
        super.ngOnInit();
        this.$richTextEditor = $(this.nativeElement.querySelector('[richTextEditor]'));
        this.$hiddenInputEle = $(this.nativeElement.querySelector('input.model-holder.ng-hide'));
        this.initEditor();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.performEditorOperation('destroy');
    }
}
