import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';

const tagName = 'div';
const idGen = new IDGenerator('wm_popover_ref_');

register('wm-popover', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            let markup = '';
            // check if the content is partial
            if (attrs.has('content')) {
                const contentsource = attrs.get('contentsource');
                const content = attrs.get('content');

                if (contentsource !== 'inline') {
                    markup = `<div wmContainer partialContainer content=${content}></div>`;
                }
            }

            return `<${tagName} popoverId="${counter}" wmPopover #${counter}="wmPopover"  ${getAttrMarkup(attrs)}><ng-template>
                        <button class="popover-start" (keydown)="${counter}.popoverStart($event)"></button>
                        ${markup}
                        <button class="popover-end" (keydown)="${counter}.popoverEnd($event)"></button>`;
        },
        post: () => `</ng-template></${tagName}>`
    };
});

export default () => {};


