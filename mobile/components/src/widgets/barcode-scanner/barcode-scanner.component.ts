import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector } from '@angular/core';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { APPLY_STYLES_TYPE, provideAsWidgetRef, IWidgetConfig, StylableComponent, styler } from '@wm/components';
import { hasCordova } from '@wm/core';

import { registerProps } from './barcode-scanner.props';

registerProps();

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

    public barcodeformat: string;
    public datavalue: string;

    constructor(private scanner: BarcodeScanner, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    @HostListener('click', ['$event'])
    public openBarcodescanner($event) {
        let options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            this.scanner.scan(options)
                .then((data) => {
                    this.datavalue = data.text;
                    this.invokeEventCallback('success', {$event});
                });
        } else {
            this.invokeEventCallback('success', {$event});
        }
    }
}
