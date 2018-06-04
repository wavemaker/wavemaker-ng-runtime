import { Element } from '@angular/compiler';

import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'wm-popover';

register('wm-popover', (): IBuildTaskDef => {
    return {
        template: (node: Element, shared) => shared.set('hasChildren', !!node.children.length),
        pre: (attrs: Map<string, string>, shared: Map<string, any>) => {
            const contentSource = attrs.get('contentsource');
            let popoverTemplate;

            if (contentSource !== 'inline') {
                const content = attrs.get('content');
                const bindContent = attrs.get('content.bind');

                let contentMarkup = '';

                if (content) {
                    contentMarkup = `content="${content}"`;
                } else if (bindContent) {
                    contentMarkup = `content.bind="${bindContent}"`;
                }

                popoverTemplate = `<div wmContainer partialContainer ${contentMarkup}></div>`;
                shared.set('hasChildren', false);
            }

            let markup = `<${tagName} wmPopover ${getAttrMarkup(attrs)}>`;

            if (popoverTemplate || !!shared.get('hasChildren')) {
                markup += `<ng-template>`;
            }

            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += `${popoverTemplate ? popoverTemplate : ''}</ng-template>`;
            }

            return markup;
        },
        post: (attrs: Map<string, string>, shared: Map<string, any>) => {
            let markup = '';
            if (!!shared.get('hasChildren')) {
                markup += `</ng-template>`;
            }

            return `${markup}</${tagName}>`;
        }
    };
});

export default () => {};


