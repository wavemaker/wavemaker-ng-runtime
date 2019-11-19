import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-segmented-control', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSegmentedControl ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/containers/segmented-control',
            name: 'SegmentedControlModule'
        }]
    };
});

export default () => {};
