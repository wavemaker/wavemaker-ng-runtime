import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    const props = new Map(
        [
            ['animation', PROP_STRING],
            ['class', PROP_STRING],
            ['conditionalclass', PROP_ANY],
            ['conditionalstyle', PROP_ANY],
            ['encodeurl', PROP_STRING],
            ['hint', PROP_STRING],
            ['arialabel', PROP_STRING],
            ['name', PROP_STRING],
            ['pictureaspect', {value: 'None', ...PROP_STRING}],
            ['alttext', {value: 'Image alt text not provided', ...PROP_STRING}],
            ['pictureplaceholder', PROP_STRING],
            ['picturesource', PROP_STRING],
            ['resizemode', {value: 'fill', ...PROP_STRING}],
            ['shape', PROP_STRING],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['tabindex', {value: 0, ...PROP_NUMBER}]
        ]
    );
    register('wm-picture', props);
};
