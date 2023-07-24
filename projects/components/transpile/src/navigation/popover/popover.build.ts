import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'wm-popover';

register('wm-popover', (): IBuildTaskDef => {
    return {
        requires: ['wm-table'],
        pre: (attrs: Map<string, string>, shared: Map<string, any>, table) => {
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

                popoverTemplate = `<div wmContainer #partial partialContainer ${contentMarkup}>`;
                shared.set('hasPopoverContent', true);
            }

            let markup = `<${tagName} wmPopover ${getAttrMarkup(attrs)}>`;
            const contextAttrs = table ? `let-row="row"` : ``;

            markup += `<ng-template ${contextAttrs}><div class="popover-start" aria-label="popover start" tabindex="0"></div>`;

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

            return `${markup}<div class="popover-end" aria-label="popover end" tabindex="0"></div></ng-template></${tagName}>`;
        }
    };
});

export default () => {};
