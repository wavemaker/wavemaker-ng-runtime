import { PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-left-panel',
        new Map(
            [
                ['animation', {value: 'slide-in', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['columnwidth', { value: 2, ...PROP_NUMBER}],
                ['content', PROP_STRING],
                ['gestures', {value: 'on', ... PROP_STRING}],
                ['name', PROP_STRING],
                ['xscolumnwidth', { value: 10, ...PROP_NUMBER}]
            ]
        )
    );
};
