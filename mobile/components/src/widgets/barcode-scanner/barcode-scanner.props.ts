import { PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-barcodescanner',
        new Map(
            [
                ['barcodeformat', {value: 'ALL', ...PROP_STRING}],
                ['caption', {value: '', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['iconclass', {value: 'glyphicon glyphicon-barcode', ...PROP_STRING}],
                ['iconsize', {value: '2em', ...PROP_STRING}]
            ]
        )
    );
};
