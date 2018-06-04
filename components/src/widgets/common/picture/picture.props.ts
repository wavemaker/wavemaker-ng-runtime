import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN, PROP_NUMBER } from '../../framework/widget-props';
import { PROP_BOOLEAN_NOTIFY } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-picture',
        new Map(
            [
                ['encodeurl', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['offline', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['pictureaspect', PROP_STRING_NOTIFY],
                ['pictureplaceholder', PROP_STRING_NOTIFY],
                ['picturesource', PROP_STRING_NOTIFY],
                ['shape', PROP_STRING_NOTIFY],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
