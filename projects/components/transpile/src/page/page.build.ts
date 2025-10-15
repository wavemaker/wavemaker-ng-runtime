import {Attribute, Element, ParseSourceSpan, Text} from '@angular/compiler';

import {IDGenerator} from '@wm/core';
import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {forEach} from "lodash-es";

const tagName = 'div';

const findChild = (node: Element, childName: string): Element => {
    const child = node && node.children.find(e => (e instanceof Element && (e as Element).name === childName));
    return child as Element;
};

const createElement = name => {
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
                // Use *ngIf structural directive
                const conditionalNode = createElement('ng-container');
                const ngIfAttr = new Attribute('*ngIf', 'compilePageContent', noSpan, undefined, noSpan, undefined, undefined);
                conditionalNode.attrs.push(ngIfAttr);
                conditionalNode.children = conditionalNode.children.concat(pageContentNode.children);
                conditionalNode.children.push(new Text('{{onPageContentReady()}}', null, undefined, undefined));
                pageContentNode.children = [conditionalNode];
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
