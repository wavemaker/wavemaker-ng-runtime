import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN, PROP_NUMBER } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-picture',
        new Map(
            [
                ['animation', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['encodeurl', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['pictureaspect', PROP_STRING_NOTIFY],
                ['pictureplaceholder', PROP_STRING_NOTIFY],
                ['picturesource', PROP_STRING_NOTIFY],
                ['shape', PROP_STRING_NOTIFY],
                ['shape', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
