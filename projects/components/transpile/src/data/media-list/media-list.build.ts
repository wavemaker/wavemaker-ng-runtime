import { Attribute, Element } from '@angular/compiler';

import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const wmlistTag = 'wm-list';
const tagName = 'div';
const dataSetKey = 'dataset';

function copyAttribute(from: Element, fromAttrName: string, to: Element, toAttrName: string) {
    const fromAttr = from.attrs.find( a => a.name === fromAttrName);
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}

register('wm-media-list', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            let bindDataset;
            const attrObj = node.attrs.find(attr => attr.name === dataSetKey),
                /**
                 *  Replacing binded property value with item
                 * @param children
                 */
                replaceBind = (children = []) => {
                    children.forEach(childNode => {
                        if (childNode.name) {
                            // return if the child Element is of wm-list .
                            if (childNode.name !== wmlistTag) {
                                childNode.attrs.forEach((attr) => {
                                    if (attr.value.startsWith(`bind:${bindDataset}.data[$i]`)) {
                                        attr.value = attr.value.replace(`${bindDataset}.data[$i]`, 'item');
                                    } else if (attr.value.startsWith(`bind:${bindDataset}`)) {
                                        attr.value = attr.value.replace(bindDataset, 'item');
                                    }
                                });
                                replaceBind(childNode.children);
                            }
                        }
                    });
                };
            if (attrObj && attrObj.value.startsWith('bind:')) {
                bindDataset = attrObj.value.replace('bind:', '');
            }
            if (bindDataset) {
                replaceBind(node.children);
            }
            const template = <Element> node.children
                .find(e => e instanceof Element && (<Element> e).name === 'wm-media-template');
            if (template != null) {
                copyAttribute(template, 'width', node, 'thumbnailwidth');
                copyAttribute(template, 'height', node, 'thumbnailheight');
            }
        },
        pre: attrs => `<${tagName} wmMediaList ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        },{
            from: '@wm/components/page',
            name: 'PageModule'
        },{
            from: '@wm/mobile/components/page/mobile-navbar',
            name: 'MobileNavbarModule'
        },{
            from: '@wm/mobile/components/basic',
            name: 'BasicModule',
            as: 'WM_MobileBasicMobile'
        },{
            from: '@wm/mobile/components/data/media-list',
            name: 'MediaListModule'
        }]
    };
});

export default () => {};
