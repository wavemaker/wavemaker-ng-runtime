import { Component, ContentChild, ElementRef, Injector, TemplateRef } from '@angular/core';

import { $appDigest, $parseExpr, addClass, isArray, isObject, isString, removeClass } from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './media-list.props';

const DEFAULT_CLS = 'app-medialist';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-media-list', hostClass: DEFAULT_CLS};

enum Layout {
    SINGLE_ROW = 'Single-row',
    MULTI_ROW = 'Multi-row'
}

@Component({
    selector: '[wmMediaList]',
    templateUrl: './media-list.component.html',
    providers: [
        provideAsWidgetRef(MediaListComponent)
    ]
})
export class MediaListComponent extends StylableComponent {
    static initializeProps = registerProps();

    private $fullScreenEle;
    public binddataset;
    public fieldDefs: any[]  [];
    public mediaurl: string;
    public thumbnailurl: string;
    public selectedMediaIndex = -1;

    @ContentChild('mediaListTemplate') mediaListTemplate: TemplateRef<ElementRef>;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    public appendToBody() {
        if (!this.$fullScreenEle) {
            setTimeout(() => {
                this.$fullScreenEle = this.$element.find('>.app-media-fullscreen');
                this.$fullScreenEle.appendTo('body:first-child');
            }, 100);
        }
        return true;
    }

    public onPropertyChange(key, nv, ov?) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        } else if (key === 'layout') {
            if (nv === Layout.SINGLE_ROW) {
                addClass(this.nativeElement, 'singlerow');
            } else {
                removeClass(this.nativeElement, 'singlerow');
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public exitFullScreen() {
        this.selectedMediaIndex = -1;
        this.$fullScreenEle.appendTo(this.$element);
        this.$fullScreenEle = null;
        $appDigest();
    }

    public getPicTitle() {
        return this.selectedMediaIndex + 1 + '/' + this.fieldDefs.length;
    }

    public showFullScreen(i) {
        this.selectedMediaIndex = i;
        $appDigest();
    }

    public showNext() {
        if (this.selectedMediaIndex < this.fieldDefs.length - 1) {
            this.selectedMediaIndex++;
            $appDigest();
        }
    }

    // Returns the field value (src) from the fieldDefs
    private getSrc(field) {
        if (field) {
            return this.fieldDefs[this.selectedMediaIndex][field];
        }
        return '';
    }

    public showPrev() {
        if (this.selectedMediaIndex > 0) {
            this.selectedMediaIndex--;
            $appDigest();
        }
    }

    private onDataChange(nv: any) {
        if (nv) {

            if (isObject(nv) && !isArray(nv)) {
                nv = [nv];
            }
            if (!this.binddataset) {
                if (isString(nv)) {
                    nv = nv.split(',');
                }
            }
            if (isArray(nv)) {
                this.updateFieldDefs(nv as any[]);
            }
        } else {
            this.updateFieldDefs([]);
        }
    }

    /** With given data, creates media list items*/
    private updateFieldDefs(data: any[]) {
        this.fieldDefs = data;
        data.forEach(field => {
            field.mediaUrlVal     = $parseExpr(this.mediaurl)(field);
            field.thumbnailUrlVal = $parseExpr(this.thumbnailurl)(field);
        });
        this.fieldDefs = data;
    }

    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    private listTrackByFn(index: number): number {
        return index;
    }
}
