import { PROP_ANY, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-media-list',
        new Map(
            [
                ['dataset', PROP_ANY],
                ['layout', {value: 'Single-row', ...PROP_STRING}],
                ['mediaurl', PROP_STRING],
                ['thumbnailheight', {value: '100pt', ...PROP_STRING}],
                ['thumbnailwidth', {value: '100pt', ...PROP_STRING}],
                ['thumbnailurl', PROP_STRING],
            ]
        )
    );
};
