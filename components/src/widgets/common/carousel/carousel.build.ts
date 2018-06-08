import { Element } from '@angular/compiler';
import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';

const carouselTagName = 'carousel';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_carousel_ref_');

/**
 *  Replacing binded property value with $implicit
 * @param children: children of node
 * @param bindDataset: binded dataset of carousel
 */
const replaceBind = (children = [], bindDataset) => {
    children.forEach(childNode => {
        if (childNode.name) {
            childNode.attrs.forEach((attr) => {
                if (attr.value.startsWith(`bind:${bindDataset}`)) {
                    attr.value = attr.value.replace(bindDataset, '$implicit');
                }
            });
            replaceBind(childNode.children, bindDataset);
        }
    });
};

const isDynamicCarousel = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');

const getBindDataset = node => {
    const attrObj = node.attrs.find(attr => attr.name === dataSetKey && attr.value.startsWith('bind:'));
    return attrObj ? `${attrObj.value.replace('bind:', '')}[$i]` : undefined;
};

register('wm-carousel', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the carousel
            const counter = idGen.nextUid();
            shared.set('carousel_ref', counter);
            return `<${carouselTagName} wmCarousel #${counter}="wmCarousel"  ${getAttrMarkup(attrs)} interval="0" [ngClass]="${counter}.navigationClass">`;
        },
        post: () => `</${carouselTagName}>`,
        template: (node: Element) => {
            // check if the carousel is dynamic
            if (isDynamicCarousel(node)) {
                const bindDataset = getBindDataset(node);
                if (bindDataset) {
                    replaceBind(node.children, bindDataset);
                }
            }
        },
        //To provide parent carousel reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('carousel_ref', shared.get('carousel_ref'));
            return provider;
        }
    };
});

export default () => {};