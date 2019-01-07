import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

const barcodeFormatOptions = {
    'ALL' : 'ALL',
    'CODABAR' : 'CODABAR (not supported in iOS)',
    'CODE_39' : 'CODE_39',
    'CODE_93' : 'CODE_93 (not supported in iOS)',
    'CODE_128' : 'CODE_128',
    'DATA_MATRIX' : 'DATA_MATRIX',
    'EAN_8' : 'EAN_8',
    'EAN_13' : 'EAN_13',
    'ITF' : 'ITF',
    'PDF_417' : 'PDF_417 (not supported in iOS)',
    'QR_CODE' : 'QR_CODE',
    'RSS14' : 'RSS14 (not supported in iOS)',
    'RSS_EXPANDED' : 'RSS_EXPANDED (not supported in iOS)',
    'UPC_E' : 'UPC_E',
    'UPC_A' : 'UPC_A'
};

export class ScanService extends DeviceVariableService {
    name = 'scan';
    operations: IDeviceVariableOperation[] = [];

    constructor(barcodeScanner: BarcodeScanner) {
        super();
        this.operations.push(new ScanOperation(barcodeScanner));
    }
}

class ScanOperation implements IDeviceVariableOperation {
    public readonly name = 'scanBarCode';
    public readonly model = {
        text : 'BAR CODE',
        format : 'TEXT',
        cancelled : false
    };
    public readonly properties = [
        {
            target    : 'barcodeFormat',
            type      : 'list',
            options   : barcodeFormatOptions,
            value     : 'ALL',
            group     : 'properties',
            subGroup  : 'behavior',
            hide      : false
        }
    ];
    public readonly requiredCordovaPlugins = ['BARCODE_SCANNER'];

    constructor(private barcodeScanner: BarcodeScanner) {

    }

    public invoke(variable: any, options: any): Promise<any> {
        let scanOptions;
        if (variable.barcodeFormat && variable.barcodeFormat !== 'ALL') {
            scanOptions = {formats : variable.barcodeFormat};
        }
        return this.barcodeScanner.scan(scanOptions);
    }
}
