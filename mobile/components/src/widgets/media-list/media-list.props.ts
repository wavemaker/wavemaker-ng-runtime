import { PROP_STRING, PROP_STRING_NOTIFY, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-media-list',
        new Map(
            [
                ['dataset', {notify: true}],
                ['layout', {value: 'Single-row', ...PROP_STRING_NOTIFY}],
                ['mediaurl', PROP_STRING],
                ['thumbnailheight', {value: '100pt', ...PROP_STRING}],
                ['thumbnailwidth', {value: '100pt', ...PROP_STRING}],
                ['thumbnailurl', PROP_STRING],
            ]
        )
    );
};
