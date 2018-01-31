import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-slider',
        new Map(
            [
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['maxvalue', PROP_NUMBER],
                ['minvalue', PROP_NUMBER],
                ['name', PROP_STRING],
                ['readonly', PROP_BOOLEAN],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['step', PROP_NUMBER],
                ['tabindex', Object.assign({value: 0}, PROP_NUMBER)]
            ]
        )
    );
};
