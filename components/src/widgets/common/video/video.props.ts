import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-video',
        new Map(
            [
                ['accessroles', {value: 'Everyone', ...PROP_STRING}],
                ['autoplay', PROP_BOOLEAN],
                ['controls', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['loop', PROP_BOOLEAN],
                ['mp4format', PROP_STRING_NOTIFY],
                ['muted', PROP_BOOLEAN],
                ['oggformat', PROP_STRING_NOTIFY],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['subtitlelang', {value: 'en', ...PROP_STRING}],
                ['subtitlesource', PROP_STRING_NOTIFY],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['videoposter', {value: 'resources/images/imagelists/default-image.png', ...PROP_STRING_NOTIFY}],
                ['videopreload', {value: 'none', ...PROP_STRING}],
                ['videosupportmessage', {value: 'Your browser does not support the video tag.', ...PROP_STRING}],
                ['webmformat', PROP_STRING_NOTIFY]
            ]
        )
    );
};
