import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-pagedialog', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const content = attrs.get('content');
            attrs.delete('content');

            const onLoad = attrs.get('on-load');
            attrs.delete('on-load');

            let onLoadEvtMarkup = '';
            let contentMakrup = '';

            if (onLoad) {
                onLoadEvtMarkup = `load.event="${onLoad}"`;
            }

            if (content) {
                if (content.startsWith('bind:')) {
                    contentMakrup = `content.bind=${content.substr(5)}`;
                } else {
                    contentMakrup = `content=${content}`;
                }
            }

            let containerMarkup = '';
            if (contentMakrup) {
                containerMarkup += `<ng-template><div wmContainer partialContainer content="${content}" width="100%" height="100%" ${onLoadEvtMarkup}></div></ng-template>`;
            }

            return `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>${containerMarkup}`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
