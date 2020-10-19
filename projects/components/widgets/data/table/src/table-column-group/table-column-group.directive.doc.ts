import { Input, Directive } from '@angular/core';

/**
 * The `wmTableColumnColumn` serves the purpose of providing column group definitions to the parent wmTable directive. wmTableColumnColumn is internally used by wmTable.
 */
@Directive()
export class TableColumnGroup {
    /**
     * Title of the column group header.
     */
    @Input() caption: string;
    /**
     * Name of the column group.
     */
    @Input() name: string;
    /**
     * This property allows user to bind expression to column group class.
     */
    @Input() colClass: string;
}