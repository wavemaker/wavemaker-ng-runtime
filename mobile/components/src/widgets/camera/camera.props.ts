import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-camera',
        new Map(
            [
                ['allowedit', {value: false, ...PROP_BOOLEAN}],
                ['capturetype', {value: 'IMAGE', ...PROP_STRING}],
                ['caption', {value: '', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['correctorientation', {value: false, ...PROP_BOOLEAN}],
                ['datavalue', {value: '', ...PROP_STRING}],
                ['iconclass', {value: 'wi wi-photo-camera', ...PROP_STRING}],
                ['iconsize', {value: '2em', ...PROP_STRING}],
                ['imagequality', {value: 80, ...PROP_NUMBER}],
                ['imageencodingtype', {value: 'JPEG', ...PROP_STRING}],
                ['imagetargetwidth', PROP_NUMBER],
                ['imagetargetheight', PROP_NUMBER],
                ['localFile', {value: '', ...PROP_STRING}],
                ['localFilePath', {value: '', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['savetogallery', {value: false, ...PROP_BOOLEAN}],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
