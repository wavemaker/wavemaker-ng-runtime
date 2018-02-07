import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-video',
        new Map(
            [
                ['accessroles', Object.assign({value: 'Everyone'}, PROP_STRING)],
                ['autoplay', PROP_BOOLEAN],
                ['controls', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['loop', PROP_BOOLEAN],
                ['mp4format', PROP_STRING_NOTIFY],
                ['muted', PROP_BOOLEAN],
                ['oggformat', PROP_STRING_NOTIFY],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['subtitlelang', Object.assign({value: 'en'}, PROP_STRING)],
                ['subtitlesource', PROP_STRING_NOTIFY],
                ['tabindex', Object.assign({value: 0}, PROP_NUMBER)],
                ['videoposter', Object.assign({value: 'resources/images/imagelists/default-image.png'}, PROP_STRING_NOTIFY)],
                ['videopreload', Object.assign({value: 'none'}, PROP_STRING)],
                ['videosupportmessage', Object.assign({value: 'Your browser does not support the video tag.'}, PROP_STRING)],
                ['webmformat', PROP_STRING_NOTIFY]
            ]
        )
    );
};
