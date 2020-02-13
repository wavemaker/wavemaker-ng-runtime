import { PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-left-panel',
        new Map(
            [
                ['animation', {value: 'slide-in', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['columnwidth', { value: 3, ...PROP_NUMBER}],
                ['content', PROP_STRING],
                ['gestures', {value: 'on', ... PROP_STRING}],
                ['name', PROP_STRING],
                ['xscolumnwidth', { value: 10, ...PROP_NUMBER}]
            ]
        )
    );
};
