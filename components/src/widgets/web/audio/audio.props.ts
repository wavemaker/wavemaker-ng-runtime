import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-audio',
        new Map(
            [
                ['accessroles', {value: 'Everyone', ...PROP_STRING}],
                ['audiopreload', {value: 'none', ...PROP_STRING}],
                ['audiosupportmessage', {value: 'Your browser does not support the audio tag.', ...PROP_STRING}],
                ['autoplay', PROP_BOOLEAN],
                ['controls', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['loop', PROP_BOOLEAN],
                ['mp3format', PROP_STRING_NOTIFY],
                ['muted', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['subtitlelang', {value: 'en', ...PROP_STRING}],
                ['subtitlesource', PROP_STRING_NOTIFY],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
