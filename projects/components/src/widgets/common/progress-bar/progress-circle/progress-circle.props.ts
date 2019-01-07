import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-progress-circle',
        new Map(
            [
                ['captionplacement', {value: 'inside', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['datavalue', {value: '30', ...PROP_STRING}],
                ['displayformat', {value: '9%', ...PROP_STRING}],
                ['hint', PROP_STRING],
                ['maxvalue', {value: 100, ...PROP_NUMBER}],
                ['minvalue', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['subtitle', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING],
                ['type', {value: 'default', ...PROP_STRING}]
            ]
        )
    );
};
