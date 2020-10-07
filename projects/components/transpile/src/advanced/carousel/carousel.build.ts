import { Element } from '@angular/compiler';
import { IBuildTaskDef, getAttrMarkup, register, getBoundToExpr } from '@wm/transpiler';
import { IDGenerator, updateTemplateAttrs } from '@wm/core';

const carouselTagName = 'carousel';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_carousel_ref_');

const isDynamicCarousel = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');

register('wm-carousel', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the carousel
            const counter = idGen.nextUid();
            shared.set('carousel_ref', counter);
            return `<div class="app-carousel carousel"><${carouselTagName} wmCarousel #${counter}="wmCarousel" ${getAttrMarkup(attrs)} (activeSlideChange)="${counter}.slideChange($event)" interval="0" [ngClass]="${counter}.navigationClass">`;
        },
        post: () => `</${carouselTagName}></div>`,
        template: (node: Element) => {
            // check if the carousel is dynamic
            if (isDynamicCarousel(node)) {
                const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
                const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');

                if (!datasetAttr) {
                    return;
                }
                const boundExpr = getBoundToExpr(datasetAttr.value);

                if (!boundExpr) {
                    return;
                }
                updateTemplateAttrs(node, boundExpr, widgetNameAttr.value);
            }
        },
        // To provide parent carousel reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('carousel_ref', shared.get('carousel_ref'));
            return provider;
        }
    };
});

export default () => {};
