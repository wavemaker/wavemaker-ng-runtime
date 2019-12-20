import { Component, Injector, NgZone, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { setCSS, setHtml } from '@wm/core';
import { APPLY_STYLES_TYPE, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { BaseFormCustomComponent } from '@wm/components/input';

import { registerProps } from './rich-text-editor.props';

const WIDGET_INFO = {widgetType: 'wm-richtexteditor', hostClass: 'app-richtexteditor clearfix'};

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

const overrideSummerNote = () => {
    if (!$.summernote.__overidden) {
        // override summernote methods

        const origFn = $.summernote.ui.button.bind($.summernote);

        $.summernote.ui.button = (...args) => {

            const retVal = origFn(...args);
            const origCallback = retVal.callback;

            retVal.callback = ($node, options) => {
                // add bs3 btn class to the buttons
                $node.addClass('btn');
                return origCallback($node, options);
            };
            return retVal;
        };
        $.summernote.__overidden = true;
    }
};

@Component({
    selector: 'div[wmRichTextEditor]',
    templateUrl: './rich-text-editor.component.html',
    providers: [
        provideAs(RichTextEditorComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(RichTextEditorComponent)
    ]
})
export class RichTextEditorComponent extends BaseFormCustomComponent implements OnInit, OnDestroy {
    static initializeProps = registerProps();

    $richTextEditor;
    $hiddenInputEle;

    proxyModel;
    _operationStack = [];
    isEditorLoaded = false;

    public showpreview: any;
    public disabled: boolean;

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
                this.proxyModel = this.domSanitizer.sanitize(SecurityContext.HTML, contents.toString());
                this.invokeOnChange(contents, getChangeEvt(), true);
                this.invokeOnTouched();
            }
        },
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'],
        placeholder: 'write here...',
        minHeight: 100,
        disableResizeEditor: true
    };

    get htmlcontent() {
        return this.performEditorOperation('code');
    }

    get datavalue() {
        return this.htmlcontent;
    }

    set datavalue(nv) {
        if (nv !== undefined && nv !== null) {
            this.$hiddenInputEle.val(nv);
            this.performEditorOperation('reset');
            this.performEditorOperation('code', nv);
        }
    }

    constructor(inj: Injector, private domSanitizer: DomSanitizer, private ngZone: NgZone) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
        overrideSummerNote();
    }

    ngOnInit() {
        this.$richTextEditor = $(this.nativeElement.querySelector('[richTextEditor]'));
        this.$hiddenInputEle = $(this.nativeElement.querySelector('input.model-holder'));
        super.ngOnInit();
        this.initEditor();
    }

    initEditor() {
        this.ngZone.runOutsideAngular(() => {
            this.$richTextEditor.summernote(this.EDITOR_DEFAULT_OPTIONS);
        });

    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'placeholder') {
            this.performEditorOperation('placeholder', nv);
        } else if (key === 'disabled' || key === 'readonly') {
            this.performEditorOperation(nv ? 'disable' : 'enable');
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    onStyleChange(key, nv, ov) {
        if (key === 'height') {
            this.performEditorOperation('height', nv);
        }
    }

    performEditorOperation(key, value?) {
        if (this.isEditorLoaded) {
            if (key === 'height') {
                setCSS(this.nativeElement.querySelector('div.note-editable'), key, value, true);
            } else if (key === 'placeholder') {
                setHtml(this.nativeElement.querySelector('div.note-placeholder'), value, true);
            } else {
                // if editor content is empty then summernote('code') is returning empty p tags like <p></br></p>. So checking for empty and returning undefined.
                if (arguments.length === 1 && key === 'code' && this.$richTextEditor.summernote('isEmpty')) {
                    const content = this.$richTextEditor.summernote('code');
                    return content === '' ? content : undefined;
                }
                return this.$richTextEditor.summernote(key, value);
            }
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
