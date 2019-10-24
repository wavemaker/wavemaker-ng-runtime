import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-audio',
        new Map(
            [
                ['audiopreload', {value: 'none', ...PROP_STRING}],
                ['audiosupportmessage', {value: 'Your browser does not support the audio tag.', ...PROP_STRING}],
                ['autoplay', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['controls', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['loop', PROP_BOOLEAN],
                ['mp3format', PROP_STRING],
                ['muted', PROP_BOOLEAN],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
