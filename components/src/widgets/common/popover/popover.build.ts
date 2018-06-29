import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'wm-popover';

register('wm-popover', (): IBuildTaskDef => {
    return {
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

                popoverTemplate = `<div wmContainer partialContainer ${contentMarkup}>`;
                shared.set('hasPopoverContent', true);
            }

            let markup = `<${tagName} wmPopover ${getAttrMarkup(attrs)}>`;

            markup += `<ng-template>`;

            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += `${popoverTemplate ? popoverTemplate : ''}`;
            }

            return markup;
        },
        post: (attrs: Map<string, string>, shared: Map<string, any>) => {
            let markup = '';
            if (shared.get('hasPopoverContent')) {
                markup += `</div>`;
            }

            return `${markup}</ng-template></${tagName}>`;
        }
    };
});

export default () => {};


