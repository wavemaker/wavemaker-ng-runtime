import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-login', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLogin ${getAttrMarkup(attrs)} eventsource.bind="Actions.loginAction">`,
        post: () => `</${tagName}>`,
        provide: () => {
            const provider = new Map();
            provider.set('isLogin', true);
            return provider;
        }
    };
});

export default () => {};
