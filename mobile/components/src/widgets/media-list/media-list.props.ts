import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-media-list',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['layout', {value: 'Single-row', ...PROP_STRING}],
                ['mediaurl', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['thumbnailheight', {value: '100pt', ...PROP_STRING}],
                ['thumbnailwidth', {value: '100pt', ...PROP_STRING}],
                ['thumbnailurl', PROP_STRING],
            ]
        )
    );
};
