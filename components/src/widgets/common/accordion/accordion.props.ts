import { PROP_BOOLEAN, PROP_NUMBER, PROP_NUMBER_NOTIFY, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-accordion',
        new Map(
            [
                ['class', PROP_STRING],
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['defaultpaneindex', PROP_NUMBER_NOTIFY],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
