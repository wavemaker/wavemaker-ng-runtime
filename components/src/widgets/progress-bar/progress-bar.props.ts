import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER, PROP_NUMBER_NOTIFY } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-progressbar',
        new Map(
            [
                ['captionplacement', {value: 'hidden', ...PROP_STRING_NOTIFY}],
                ['dataset', PROP_STRING_NOTIFY],
                ['datavalue', PROP_STRING_NOTIFY],
                ['displayformat', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING],
                ['maxvalue', {value: 100, ...PROP_NUMBER_NOTIFY}],
                ['minvalue', {value: 0, ...PROP_NUMBER_NOTIFY}],
                ['pollinterval', PROP_NUMBER_NOTIFY],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['type', {value: 'default', ...PROP_STRING_NOTIFY}]
            ]
        )
    );
};
