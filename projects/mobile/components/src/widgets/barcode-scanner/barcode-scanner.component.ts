import { Component, HostListener, Injector } from '@angular/core';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { hasCordova } from '@wm/core';

import { registerProps } from './barcode-scanner.props';

const DEFAULT_CLS = 'btn app-barcode';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-barcodescanner', hostClass: DEFAULT_CLS};

@Component({
    selector: 'button[wmBarcodescanner]',
    templateUrl: './barcode-scanner.component.html',
    providers: [
        provideAsWidgetRef(BarcodeScannerComponent)
    ]
})
export class BarcodeScannerComponent extends StylableComponent {
    static initializeProps = registerProps();

    public barcodeformat: string;
    public datavalue: string;
    public iconclass: any;
    public iconsize: any;
    public caption: any;


    constructor(private scanner: BarcodeScanner, inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    @HostListener('click', ['$event'])
    public openBarcodescanner($event) {
        this.scan().then(text => {
                this.datavalue = text;
                this.invokeEventCallback('success', {$event});
            });
    }

    private scan(): Promise<string> {
        let options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            return this.scanner.scan(options)
                .then(data => data.text);
        }
        return Promise.resolve('BAR_CODE');
    }
}
