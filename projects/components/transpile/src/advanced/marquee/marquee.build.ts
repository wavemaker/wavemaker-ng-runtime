import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'marquee';

register('wm-marquee', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} onmouseover="this.stop();" onmouseout="this.start();" wmMarquee role="marquee" aria-live="off" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/advanced/marquee',
            name: 'MarqueeModule'
        }]
    };
});

export default () => {};
