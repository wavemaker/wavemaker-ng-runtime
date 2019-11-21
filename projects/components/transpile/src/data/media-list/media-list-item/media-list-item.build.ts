import { IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ng-template';

register('wm-media-template', (): IBuildTaskDef => {
    return {
        pre: () => `<${tagName} #mediaListTemplate let-item="item" let-index="index">`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/basic',
            name: 'BasicModule',
            as: 'WM_MobileBasicModule',
            platformType: 'MOBILE'
        },{
            from: '@wm/mobile/components/data/media-list',
            name: 'MediaListModule'
        }]
    };
});

export default () => {};
