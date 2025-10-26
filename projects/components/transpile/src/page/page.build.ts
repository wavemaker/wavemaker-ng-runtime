import {Element, ParseSourceSpan, Text} from '@angular/compiler';

import {IDGenerator} from '@wm/core';
import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {forEach} from "lodash-es";

const tagName = 'div';

const findChild = (node: Element, childName: string): Element => {
    const child = node && node.children.find(e => (e instanceof Element && (e as Element).name === childName));
    return child as Element;
};

const createElement = name => {
    // Angular 20: Element constructor requires 9 arguments
    return new Element(name, [], [], [], false, noSpan, noSpan, null, false);
};

const getElementNode = (name, node) => {
    let elementNode;
    if (!node) {
        return;
    }
    forEach(node.children, (child) => {
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
const idGen = new IDGenerator('wm_page');

register('wm-page', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            let pageContentNode = findChild(findChild(node, 'wm-content'), 'wm-page-content');
            if (!pageContentNode) {
                 pageContentNode = getElementNode('wm-page-content',  getElementNode('wm-content', node));
            }
            if (pageContentNode) {
                // Wrap content in @if block with proper newlines to avoid template syntax errors
                pageContentNode.children.unshift(new Text('@if (compilePageContent) {\n', null, undefined, undefined));
                pageContentNode.children.push(new Text('\n{{onPageContentReady()}}\n}', null, undefined, undefined));
            }
        },
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmPage #${counter}="wmPage" data-role="pageContainer" [attr.aria-label]="${counter}.arialabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
