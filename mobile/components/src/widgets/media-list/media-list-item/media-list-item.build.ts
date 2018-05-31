import { IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ng-template';

register('wm-media-template', (): IBuildTaskDef => {
    return {
        pre: (attrs) => `<${tagName} #mediaListTemplate let-item="item" let-index="index">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
