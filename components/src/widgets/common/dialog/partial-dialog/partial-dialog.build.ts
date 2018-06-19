import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-pagedialog', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const content = attrs.get('content');
            attrs.delete('content');

            const boundContent = attrs.get('content.bind');
            attrs.delete('content.bind');

            const onLoad = attrs.get('on-load');
            attrs.delete('on-load');

            let onLoadEvtMarkup = '';
            let contentMarkup = '';

            if (onLoad) {
                onLoadEvtMarkup = `load.event="${onLoad}"`;
            }

            if (boundContent) {
                contentMarkup = `content.bind="${boundContent}"`;
            } else if (content) {
                contentMarkup = `content="${content}"`;
            }

            let containerMarkup = '';
            if (contentMarkup) {
                containerMarkup += `<ng-template><div wmContainer partialContainer ${contentMarkup} width="100%" height="100%" ${onLoadEvtMarkup}></div></ng-template>`;
            }

            return `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>${containerMarkup}`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
