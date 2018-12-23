import { Input } from '@angular/core';

/**
 * The wmBarcodescanner component defines the barcode-scanner widget.
 */

export class Barcodescanner {
    /**
     * Format of bar code to scan. <br>
     * <p><em>Allowed Values: </em><code>QR_CODE, DATA_MATRIX, UPC_E, UPC_A, EAN_8, EAN_13, CODE_128, CODE_39, CODE_93, CODABAR, ITF, RSS14, RSS_EXPANDED, PDF_417, AZTEC, MSI</code></p>
     */
    @Input() barcodeformat: string = 'ALL';
    /**
     * This property specifies the label of the barcode-scanner. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property specifies CSS class of the icon.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'glyphicon glyphicon-barcode';
    /**
     * This property specifies size of the icon. Value has to be specified along with the units (em or px).
     */
    @Input() iconsize: string = '2em';
    /**
     * This property specifies how the elements should be aligned horizontally. <br>
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     */
    @Input() horizontalalign: string;
    /**
     * Name of the barcode-scanner widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the barcodescanner widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This event handler is called whenever a success event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     */
    onSuccess($event: MouseEvent, widget: any) {}
}