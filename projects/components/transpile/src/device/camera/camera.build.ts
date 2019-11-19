import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-camera', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} type='button' wmCamera ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/device/camera',
            name: 'CameraModule'
        }]
    };
});

export default () => {};
