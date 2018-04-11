import { PROP_BOOLEAN, PROP_NUMBER, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-accordion',
        new Map(
            [
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['collapseicon', {value: 'wi-plus', ...PROP_STRING}],
                ['defaultpaneindex', {value: 0, ...PROP_NUMBER_NOTIFY}],
                ['expandicon', {value: 'wi-minus', ...PROP_STRING}],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
