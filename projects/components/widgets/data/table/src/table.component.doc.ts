import { Input } from '@angular/core';

/**
 * The `wmTable` is the data grid used to display data in a tabular manner.
 * `wmTable` can be bound to variables and display the data associated with them.
 */

export class Table {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * A message to show in a confirm dialog so that the user can confirm that they want to delete this row. Leave blank to delete without asking the user to confirm.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() confirmdelete: string = 'Are you sure you want to delete this?';
    /**
     * This property specifies the datasource from which data is fetched for the data table.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any;
    /**
     * This text will be displayed on cancel button for delete confirm dialog.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() deletecanceltext: string = 'Cancel';
    /**
     * This text will be displayed on confirm button for delete confirm dialog.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() deleteoktext: string = 'Ok';
    /**
     * This message will be displayed, when data is deleted by table.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() deletemessage: string = 'Record deleted successfully';
    /**
     * If this property is enabled, columns in data table can be selected by clicking the column header cells.
     */
    @Input() enablecolumnselection: boolean = false;
    /**
     * If this property is enabled, data table can be sorted by clicking the column header cells.
     */
    @Input() enablesort: boolean = true;
    /**
     * This message will be displayed, if there is an error during the CRUD operation.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() errormessage: string;
    /**
     * Export menu is shown in the header with selected export format options. Data will be downloaded in respective format selected in the export menu by user.
     * <p><em>Allowed Values: </em><code>EXCEL, CSV</code></p>
     */
    @Input() exportformat: string;
    /**
     * This property specifies the number of records to be exported.
     */
    @Input() exportdatasize: number = 100;
    /**
     * Enable filter in Data Table widget.
     * <p><em>Allowed Values: </em><code>search, multicolumn</code></p>
     * <div class="summary">
     * <p><code>search</code><em>: Search box is displayed at top of the Data Table widget for filtering data.</em></p>
     * <p><code>multicolumn</code><em>: This option enables multi-column filtering for rows. In columns tab, filter can be disabled/ enabled for specific columns.</em></p>
     */
    @Input() filtermode: string;
    /**
     * This property defines where to display the new row form on click of the new button.
     * <p><em>Allowed Values: </em><code>top, bottom</code></p>
     */
    @Input() formposition: string;
    /**
     * Classes will be applied to the data table.
     */
    @Input() gridclass: string = 'table-bordered table-striped table-hover';
    /**
     * If this property is enabled, the first record of the data table will be selected automatically when the data table is displayed.
     */
    @Input() gridfirstrowselect: boolean = false;
    /**
     * Icon Class to be shown in data table header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string;
    /**
     * This message will be displayed, when data is inserted.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() insertmessage: string = 'Record added successfully';
    /**
     * This message will be displayed when waiting for data to load.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() loadingdatamsg: string = 'Loading...';
    /**
     * This property can assign an icon that is shown while loading records.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() loadingicon: string = 'fa fa-circle-o-notch fa-spin';
    /**
     * On checking this property users can select multiple rows in table.
     */
    @Input() multiselect: boolean = false;
    /**
     * Name of the datatable widget.
     */
    @Input() name: string;
    /**
     * Select the pagination type for the widget.
     * <p><em>Allowed Values: </em><code>Basic, Pager, Classic, None</code></p>
     * <div class="summary">
     * <p><code>Basic</code><em>: This option gives a next and previous arrow along with the page numbers at the bottom of the page.</em></p>
     * <p><code>Pager</code><em>: This option gives a next and previous buttons at the bottom of the page for pagination.</em></p>
     * <p><code>Classic</code><em>: A bar with total number of pages and number of items in the current page will be displayed, along with arrows for pagination.</em></p>
     * <p><code>None</code><em>: No pagination will be provided.</em></p>
     */
    @Input() navigation: string = 'Basic';
    /**
     * This property specifies how the paginator should be aligned horizontally.
     */
    @Input() navigationalign: string = 'left';
    /**
     * This message will be displayed when there is no data to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodatamessage: string = 'No data found.';
    /**
     * This property sets the maximum number of rows to be displayed in the data table per page.
     */
    @Input() pagesize: number;
    /**
     * Show a radio column in data table widget. This enables the user to select single row.
     */
    @Input() radioselect: boolean = false;
    /**
     * The CSS class provided will be applied on the table row.
     */
    @Input() rowclass: string;
    /**
     * The CSS class will be applied on the table row based upon the evaluation of given expression.
     */
    @Input() rowngclass: string;
    /**
     * The placeholder for the search box.
     */
    @Input() searchlabel: string = 'Search';
    /**
     * This property will be used to show/hide the data table widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Show/hide header of the data table.
     */
    @Input() showheader: boolean = true;
    /**
     * This property controls whether the total record count is displayed in the data paginator or not.
     */
    @Input() showrecordcount: boolean = false;
    /**
     * Show row index column in the data table widget. Adds a serial number column for display.
     */
    @Input() showrowindex: boolean = false;
    /**
     * This property defines spacing inside table.
     * <p><em>Allowed Values: </em><code>normal, condensed</code></p>
     * <div class="summary">
     * <p><code>normal</code><em>: Normal view.</em></p>
     * <p><code>condensed</code><em>: compact table view.</em></p>
     */
    @Input() spacing: string = 'normal';
    /**
     * This property defines the sub heading or title for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;
    /**
     * This property specifies the tab order of the data table Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * Title of the data table.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * This message will be displayed, when data is updated by data table.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() updatemessage: string = 'Record updated successfully';

    /**
     * This event handler is called whenever the widget is clicked.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row row has the data of the row which is clicked and the index of the row
     */
    onClick($event: MouseEvent, widget: any, row: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event DOM event on which call back is triggered
     * @param $data $data has the data of the row which is clicked and the index of the row
     */
    onTap($event: TouchEvent, $data: any) {}
    /**
     * This event will be called when the Data Table is shown.
     */
    onShow() {}
    /**
     * This event will be called when the Data Table is hidden.
     */
    onHide() {}
    /**
     * This event will be called when a row from Data Table is selected.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row row has the data of the row which is clicked and the index of the row
     */
    onSelect($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called when a row from Data Table is deselected.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row row has the data of the row which is clicked and the index of the row
     */
    onDeselect($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called when the Data Table header is clicked to sort by a particular column.
     * @param $event DOM event on which call back is triggered
     * @param $data $data has sorted data information returned from server
     */
    onSort($event: MouseEvent, $data: any) {}
    /**
     * This event will be called when the Data Table header is clicked.
     * @param $event DOM event on which call back is triggered
     * @param $data $data has the column definition data of the corresponding clicked header
     */
    onHeaderonClick($event: MouseEvent, $data: any) {}
    /**
     * This event will be called when a row in Data Table is clicked.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row $data has the data of the row which is clicked and the index of the row
     */
    onRowclick($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called when a row in Data Table is double-clicked.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row $data has the data of the row which is clicked and the index of the row
     */
    onRowdblclick($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called when a column in Data Table is selected.
     * @param $event DOM event on which call back is triggered
     * @param $data $data has the object containing data and colDef. data has the selected column data. colDef has the selected column definition.
     */
    onColumnselect($event: MouseEvent, $data: any) {}
    /**
     * This event will be called when a column in Data Table is deselected.
     * @param $event DOM event on which call back is triggered
     * @param $data $data has the object containing data and colDef. data has the selected column data. colDef has the selected column definition.
     */
    onColumndeselect($event: MouseEvent, $data: any) {}
    /**
     * This event is fired on the edit of a row and before the inline form is rendered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row row has the data of the row being edited/ inserted
     * @param $operation $operation value is 'new' for new row and 'edit' when row being edited.
     */
    onBeforeformrender($event: MouseEvent, widget: any, row: any, $operation: string) {}
    /**
     * This event is fired after the inline form is rendered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param formWidgets formWidgets has the scopes of all the widgets in the form. Individual widget can be accessed as formWidgets.[fieldName]
     * @param $operation  $operation value is 'new' for new row and 'edit' when row being edited
     */
    onFormrender($event: MouseEvent, widget: any, formWidgets: any, $operation: string) {}
    /**
     * This event is fired before a record is deleted in the Data Table.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row row has the data of the row being edited/ inserted
     * @param options extra options can be passed by user here. Ex: setting options.period = true will send temporal call
     * @returns if the callback returns false, delete is stopped. Anything else, delete continues with modified data.
     */
    onBeforerowdelete($event: MouseEvent, widget: any, row: any, options: any): void | boolean {}
    /**
     * This event will be called when a record is deleted from the underlying data entity.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row response returned from the service call
     */
    onRowdelete($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called before a new record is inserted in the underlying data entity.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row response returned from the service call
     * @param options extra options can be passed by user here. Ex: setting options.period = true will send temporal call
     * @returns if the callback returns false, insert is stopped. Anything else, insert continues with modified data.
     */
    onBeforerowinsert($event: MouseEvent, widget: any, row: any, options: any): void | boolean {}
    /**
     *This event will be called after a new record is inserted in the underlying data entity.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row response returned from the service call
     */
    onRowinsert($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called before a record is updated to the underlying data entity.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row response returned from the service call
     * @param options extra options can be passed by user here. Ex: setting options.period = true will send temporal call
     * @returns if the callback returns false, update is stopped. Anything else, update continues with modified data.
     */
    onBeforerowupdate($event: MouseEvent, widget: any, row: any, options: any): void | boolean {}
    /**
     * This event will be called after a record is updated to the underlying data entity.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param row response returned from the service call
     */
    onRowupdate($event: MouseEvent, widget: any, row: any) {}
    /**
     * This event will be called after the edit/insert/delete operation returns a failure response.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $data response returned from the service call
     * @param $operation  $operation value is 'new' for new row and 'edit' when row being edited
     */
    onError($event: MouseEvent, widget: any, $data: any, $operation: string) {}
    /**
     * This event will be called the before the data is rendered in the Data Table
     * @param widget Instance of the widget
     * @param $data $data has the data to be rendered in the current page of data table
     * @param $columns columns definition of the data table
     */
    onBeforedatarender(widget: any, $data: any, $columns: any) {}
    /**
     * This event will be called when the data is rendered in the Data Table.
     * @param widget Instance of the widget
     * @param $data $data has the data rendered in the current page of data table
     */
    onDatarender(widget: any, $data: any) {}
    /**
     * This event handler is called when the data is set using the pagination.
     * @param $event DOM event on which call back is triggered
     * @param $data response returned from the service call
     */
    onSetrecord($event: MouseEvent, $data: any) {}
    /**
     * This event will be called before downloading the file. Any data changes like file format changes, field expression, size changes etc can be performed here. Returning false from the script will stop the file download.
     * @param $data inputData containing exportType, columns, fileName. Expression and header can be modified.
     * @returns Returning false from the script will stop the file download. Else, file is dowloaded with modfiied $data options
     */
    onExport($data: any): void | boolean {}


    /**
     * This method is used to refresh the data in data table
     * @param isSamePage If set to true, current page data is fetched. Else, first page data is fetched.
     */
    refreshData(isSamePage?: boolean) {}
    /**
     * This method is used to clear the filters applied on data table.
     * @param skipFilter If set to true, filter call is not triggred. Else, filter call is triggered with cleared filters.
     */
    clearFilter(skipFilter?: boolean) {}
    /**
     * This method is used to redraw the data table
     * @param forceRender If set to true, table is re-rendered. Else, columns are readjusted.
     */
    redraw(forceRender?: boolean) {}
    /**
     * This method is used to select the item/ row.
     * @param item item can be row index ir whole row object
     */
    selectItem(item: Object | number) {}
    /**
     * This method is used to deselect the item/ row in the Data Table
     * @param item item can be row index ir whole row object
     */
    deselectItem(item: Object | number) {}
    /**
     * This method is used to edit a row in the Data Table
     * @param event DOM event
     */
    editRow(event?: MouseEvent) {}
    /**
     * This method is used to add a new row
     */
    addRow() {}
    /**
     * This method is used to save a row
     */
    saveRow() {}
    /**
     * This method is used to cancel a row edit/ new operation
     */
    cancelRow() {}
    /**
     * This method is used to delete a row
     * @param event DOM event
     */
    deleteRow(event?: MouseEvent) {}
    /**
     * This method is used to hide the current edit/ new row and go back to view mode
     */
    hideEditRow() {}
}