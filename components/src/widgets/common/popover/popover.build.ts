import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-popover', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            let markup = '';
            // check if the content is partial
            if (attrs.has('content')) {
                const contentsource = attrs.get('contentsource');
                const content = attrs.get('content');

                if (contentsource === 'partial') {
                    markup = `<div wmContainer partialContainer content=${content}></div>`;
                }
            }

            return `<${tagName} wmPopover ${getAttrMarkup(attrs)}><ng-template>${markup}`;
        },
        post: () => `</ng-template></${tagName}>`
    };
});

export default () => {};


