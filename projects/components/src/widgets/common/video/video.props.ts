import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-video',
        new Map(
            [
                ['autoplay', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['controls', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['loop', PROP_BOOLEAN],
                ['mp4format', PROP_STRING],
                ['muted', PROP_BOOLEAN],
                ['name', PROP_STRING],
                ['oggformat', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['subtitlelang', {value: 'en', ...PROP_STRING}],
                ['subtitlesource', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['videoposter', {value: 'resources/images/imagelists/default-image.png', ...PROP_STRING}],
                ['videopreload', {value: 'none', ...PROP_STRING}],
                ['videosupportmessage', {value: 'Your browser does not support the video tag.', ...PROP_STRING}],
                ['webmformat', PROP_STRING]
            ]
        )
    );
};
