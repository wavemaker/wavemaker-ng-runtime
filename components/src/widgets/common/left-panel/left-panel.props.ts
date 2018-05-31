import { PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-left-panel',
        new Map(
            [
                ['animation', {value: 'slide-in', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['columnwidth', PROP_NUMBER_NOTIFY],
                ['content', PROP_STRING_NOTIFY],
                ['gestures', {value: 'on', ... PROP_STRING}],
                ['name', PROP_STRING],
                ['xscolumnwidth', { value: 10, ...PROP_NUMBER_NOTIFY}]
            ]
        )
    );
};
