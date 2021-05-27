import { Attribute, Element, ParseSourceSpan, Text } from '@angular/compiler';

import { isMobileApp } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
declare const _;

const findChild = (node: Element, childName: string): Element => {
    const child = node && node.children.find(e => (e instanceof Element && (e as Element).name === childName));
    return child as Element;
};

const createElement = name => {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};

const addAtrribute = (node: Element, name: string, value: string) => {
    const attr = new Attribute(name, value, noSpan, noSpan);
    node.attrs.push(attr);
};

const getElementNode = (name, node) => {
    let elementNode;
    if (!node) {
        return;
    }
    _.forEach(node.children, (child) => {
        if (child instanceof Element) {
            if ((child as Element).name === name) {
                elementNode = child;
            } else if (child.children) {
                elementNode = getElementNode(name, child);
            }
        }
        return !elementNode;
    });
    return elementNode;
};

const noSpan = ({} as ParseSourceSpan);

register('wm-page', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            let pageContentNode = findChild(findChild(node, 'wm-content'), 'wm-page-content');
            if (!pageContentNode) {
                 pageContentNode = getElementNode('wm-page-content',  getElementNode('wm-content', node));
            }
            if (pageContentNode) {
                const conditionalNode = createElement('ng-container');
                addAtrribute(conditionalNode, '*ngIf', 'compilePageContent');
                conditionalNode.children = conditionalNode.children.concat(pageContentNode.children);
                conditionalNode.children.push(new Text('{{onPageContentReady()}}', null));
                pageContentNode.children = [conditionalNode];
                if (isMobileApp()) {
                    const loader = createElement('div');
                    addAtrribute(loader, 'wmPageContentLoader', '');
                    addAtrribute(loader, '*ngIf', '!showPageContent');
                    pageContentNode.children.push(loader);
                }
            }
        },
        pre: attrs => `<${tagName} wmPage data-role="pageContainer" aria-label="${attrs.get('hint') || 'Main page content'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
