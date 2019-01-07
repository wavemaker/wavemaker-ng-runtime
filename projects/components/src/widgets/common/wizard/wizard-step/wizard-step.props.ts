import { PROP_BOOLEAN, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-wizardstep',
        new Map(
            [
                ['class', PROP_STRING],
                ['enableskip', {value: false, ...PROP_BOOLEAN}],
                ['iconclass', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['title', {value: 'Step Title', ...PROP_STRING}]
            ]
        )
    );
};
