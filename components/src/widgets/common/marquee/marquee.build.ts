import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'marquee';

register('wm-marquee', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} onmouseover="this.stop();" onmouseout="this.start();" wmMarquee ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};