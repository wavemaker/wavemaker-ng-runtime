import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { Element } from '@angular/compiler';

const wmlistTag = 'wm-list';
const listTagName = 'div';
const wmListTemplateTag = 'wm-listtemplate';
const listTemplateTagName = 'ng-template';
const dataSetKey = 'dataset';

register(wmlistTag, (): BuildTaskDef => {
        return {
            pre: (attrs) => {
                const tmpl = getAttrMarkup(attrs);
                return `<${listTagName} wmList ${tmpl}>`;
            },
            post: () => `</${listTagName}>`,
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
                                        if (attr.value.startsWith(`bind:${bindDataset}`)) {
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
            }
        };
    }
);

register(wmListTemplateTag, (): BuildTaskDef => {
    return {
        pre: () => `<${listTemplateTagName} #listTemplate let-item>`,
        post: () => `</${listTemplateTagName}>`
    };
});

export default () => {};
