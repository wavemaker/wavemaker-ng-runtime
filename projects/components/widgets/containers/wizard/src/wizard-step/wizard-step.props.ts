import {PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-wizardstep',
        new Map(
            [
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['doneiconclass', {value: 'wi wi-done', ...PROP_STRING}],
                ['dynamicStepIndex', PROP_NUMBER], // internal property
                ['enableskip', {value: false, ...PROP_BOOLEAN}],
                ['iconclass', {value: 'wi wi-person', ...PROP_STRING}],
                ['isdynamic', PROP_STRING], // internal property
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['subtitle', PROP_STRING],
                ['title', {value: 'Step Title', ...PROP_STRING}]
            ]
        )
    );
};
