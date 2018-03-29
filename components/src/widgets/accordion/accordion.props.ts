import { PROP_BOOLEAN, PROP_NUMBER, PROP_NUMBER_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-accordion',
        new Map(
            [
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['defaultpaneindex', {value: 0, ...PROP_NUMBER_NOTIFY}],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
