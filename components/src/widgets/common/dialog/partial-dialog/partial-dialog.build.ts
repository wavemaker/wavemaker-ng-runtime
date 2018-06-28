import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-pagedialog', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
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

                shared.set('hasPartialContent', true);
                containerMarkup += `<ng-template><div wmContainer partialContainer ${contentMarkup} width="100%" height="100%" ${onLoadEvtMarkup}>`;
            }

            return `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>${containerMarkup}`;
        },
        post: (attrs, shared) => {
            let preContent = '';
            if (shared.get('hasPartialContent')) {
                preContent =  `</div></ng-template>`;
            }
            return `${preContent}</${tagName}>`;
        }
    };
});

export default () => {};
