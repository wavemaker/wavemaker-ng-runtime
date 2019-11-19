import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'img';

register('wm-picture', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPicture alt="image" wmImageCache="${attrs.get('offline') || 'true'}" ${getAttrMarkup(attrs)}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        },{
            from: '@wm/mobile/components/basic',
            name: 'BasicModule',
            as: 'WM_MobileBasicModule',
            platformType: 'MOBILE'
        }]
    };
});

export default () => {};
