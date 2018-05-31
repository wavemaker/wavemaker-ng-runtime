import { PROP_NUMBER, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-progressbar',
        new Map(
            [
                ['captionplacement', {value: 'hidden', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['dataset', {notify: true}],
                ['datavalue', PROP_STRING_NOTIFY],
                ['displayformat', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING],
                ['maxvalue', {value: 100, ...PROP_NUMBER_NOTIFY}],
                ['minvalue', {value: 0, ...PROP_NUMBER_NOTIFY}],
                ['name', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['type', PROP_STRING_NOTIFY]
            ]
        )
    );
};
