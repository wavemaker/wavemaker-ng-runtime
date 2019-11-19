import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-barcodescanner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmBarcodescanner ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/device/barcode-scanner',
            name: 'BarcodeScannerModule'
        }]
    };
});

export default () => {};
