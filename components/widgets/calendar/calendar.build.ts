import { register } from '@transpiler/build';

register('wm-calendar', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmCalendar': undefined,
            'style': 'width:100%'
        }
    };
});

export default () => {};