import { PROP_ANY, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-progressbar',
        new Map(
            [
                ['captionplacement', {value: 'hidden', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['datavalue', PROP_STRING],
                ['displayformat', PROP_STRING],
                ['hint', PROP_STRING],
                ['maxvalue', {value: 100, ...PROP_NUMBER}],
                ['minvalue', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['type', PROP_STRING]
            ]
        )
    );
};
