import {Directive, Inject, Injector, Optional} from '@angular/core';

import {addClass} from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './container.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import {BaseContainerComponent} from "../base/base-container.component";

const DEFAULT_CLS = 'app-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-container',
    hostClass: DEFAULT_CLS
};

// Alignment matrix (assumes direction: 'row' as base)
const alignmentMatrix = {
  'top-left':       { justifyContent: 'flex-start', alignItems: 'flex-start' },
  'top-center':     { justifyContent: 'center',     alignItems: 'flex-start' },
  'top-right':      { justifyContent: 'flex-end',   alignItems: 'flex-start' },

  'middle-left':    { justifyContent: 'flex-start', alignItems: 'center' },
  'middle-center':  { justifyContent: 'center',     alignItems: 'center' },
  'middle-right':   { justifyContent: 'flex-end',   alignItems: 'center' },

  'bottom-left':    { justifyContent: 'flex-start', alignItems: 'flex-end' },
  'bottom-center':  { justifyContent: 'center',     alignItems: 'flex-end' },
  'bottom-right':   { justifyContent: 'flex-end',   alignItems: 'flex-end' },

  'start':          { justifyContent: 'space-between', alignItems: 'flex-start' },
  'center':         { justifyContent: 'space-between',  alignItems: 'center' },
  'end':            { justifyContent: 'space-between',  alignItems: 'flex-end' }
};

@Directive({
  standalone: true,
    selector: '[wmContainer]',
    providers: [
        provideAsWidgetRef(ContainerDirective)
    ]
})
export class ContainerDirective extends BaseContainerComponent {
    static initializeProps = registerProps();
    public direction: 'row' | 'column';
    public hasWrap: boolean = false;
    public alignment: string;
    public gap: string;
    public columngap:string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext?: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        switch (key) {
            case 'direction':
                this.direction = nv;
                if (nv === 'column') this.hasWrap = false; // disable wrap for column direction

                this.$element.css('flex-direction', nv);
                this.applyAlignment(this.alignment); 
                break;
            case 'wrap':
                this.hasWrap = nv;
                this.$element.css('flex-wrap', nv ? 'wrap' : 'nowrap');
                break;
            case 'alignment':
                if (nv) {
                    this.alignment = nv;
                    this.applyAlignment(nv);
                }
                break;
            case 'gap':
            case 'columngap':
                setTimeout(() => {
                    this.applySpacing(nv,key)
                });
                break;
        }
        super.onPropertyChange(key, nv, ov);
    }

    protected onStyleChange(key: string, nv: any, ov?: any) {
        if (key === 'alignment' && nv) {
            this.alignment = nv;
            this.applyAlignment(nv);
        }
        if (nv === 'fill') {
            if (key === 'width') this.$element.css('width', '100%');
            if (key === 'height') {
                const parentElement = this.nativeElement.parentElement;
                if(parentElement?.hasAttribute('wmcontainer')){
                  this.$element.css('align-self', 'stretch')
                }else{
                  this.$element.css('height', '100%')
                }
            }
        } else if (nv === 'hug') {
            if (key === 'width') this.$element.css('width', 'fit-content');
            if (key === 'height') this.$element.css('height', 'fit-content');
        }
        super.onStyleChange(key, nv, ov);
    }

    private applyAlignment(alignmentKey: string) {
        const base = (alignmentMatrix as any)[alignmentKey];
        if (!base) return;

        const isRow = this.direction === 'row';
        let justifyContent = isRow ? base.justifyContent : base.alignItems;
        let alignItems = isRow ? base.alignItems : base.justifyContent;

        
        this.$element.css({
            display: 'flex',
            'flex-wrap': this.hasWrap ? 'wrap' : 'nowrap',
            justifyContent: justifyContent,
            alignItems: alignItems
        });
    }

    private applySpacing(nv: string, key: string) {
        const isRow = this.direction === 'row';
        const base = (alignmentMatrix as any)[this.alignment];
        const el = this.$element;

        // Normalize values
        const gap = key === 'gap' ? nv : this.gap;
        const columngap = key === 'columngap' ? nv : this.columngap;
        const hasWrap = this.hasWrap;

        // Default gap values
        const colVal = (columngap && columngap !== 'auto') ? (columngap) : null;
        const gapVal = (gap && gap !== 'auto') ? (gap) : null;
        const rowVal = hasWrap  ? gapVal  : null;

           let justifyContent = isRow ? base.justifyContent : base.alignItems;
            let alignItems = isRow ? base.alignItems : base.justifyContent;
        // CASE: No wrap
        if (!hasWrap) {
            if (gap === 'auto') {
                el.css({
                    'justify-content': base.justifyContent,
                    'align-items' :base.alignItems
                });
            } else {
                el.css({
                    'justify-content': justifyContent,
                    'align-items': alignItems,
                    gap: `${gapVal}px`
                });
            }
        }

        // CASE: Wrap enabled
        else {
            // both auto (gap as rowgap and columngap)
            if (columngap === 'auto' && gap === 'auto') {
                el.css({
                    'justify-content': justifyContent,
                    'align-content': justifyContent
                });
            }
            // columngap auto, gap (rowgap) fixed
            else if (columngap === 'auto' && gap !== 'auto') {
                el.css({
                    'justify-content': justifyContent,
                    'align-content': alignItems,
                    'row-gap': `${rowVal}px`
                });
            }
            // gap (rowgap) auto, columngap fixed
            else if (gap === 'auto' && columngap !== 'auto') {
                el.css({
                    'align-content': 'space-between',
                    'column-gap': `${colVal}px`
                });
            }
            //  both fixed numbers
            else {
                if (colVal && rowVal) {
                    if (colVal === rowVal) {
                        el.css({ 'gap': `${colVal}px`, 'align-content': alignItems, 'justify-content': justifyContent });
                    } else {
                        el.css({ gap: `${rowVal}px ${colVal}px`, 'align-content': alignItems, 'justify-content': justifyContent });
                    }
                }
            }
            this.columngap = columngap?.toString();
        }
           this.gap = gap?.toString();
    }
}
