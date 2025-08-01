/*global $, window, angular, moment, _, document, parseInt, navigator*/
/**
 * JQuery Datagrid widget.
 */

'use strict';

$.widget('wm.datatable', {
    options: {
        data: [],
        statusMsg: '',
        colDefs: [],
        rowActions: [],
        headerConfig: [],
        sortInfo: {
            'field': '',
            'direction': ''
        },
        isMobile: false,
        enableSort: true,
        filtermode: '',
        filteronkeypress: false,
        caseinsensitive: false,
        activeRow: undefined,
        isrowselectable: false,
        allowpagesizechange: false,
        height: '100%',
        showHeader: true,
        selectFirstRow: false,
        showNewRow: true,
        showRowIndex: false,
        enableRowSelection: true,
        enableColumnSelection: false,
        multiselect: false,
        multiselecttitle: '',
        multiselectarialabel: '',
        radioselecttitle:'',
        radioselectarialabel: '',
        filterNullRecords: true,
        navigation: '',
        isdynamictable: '',
        cssClassNames: {
            'tableRow': 'app-datagrid-row',
            'headerCell': 'app-datagrid-header-cell',
            'groupHeaderCell': 'app-datagrid-group-header-cell',
            'tableCell': 'app-datagrid-cell',
            'grid': '',
            'gridDefault': 'table',
            'gridBody': 'app-datagrid-body',
            'gridFooter': 'app-datagrid-footer',
            'deleteRow': 'danger',
            'ascIcon': 'wi wi-long-arrow-up',
            'descIcon': 'wi wi-long-arrow-down',
            'selectedColumn': 'selected-column',
            'rowExpandIcon': 'wi wi-minus-square',
            'rowCollapseIcon': 'wi wi-plus-square',
            'gridRowExpansionClass': 'table-row-expansion',
            'expandedRowClass' : 'expanded'
        },
        dataStates: {
            'loading': 'Loading...',
            'ready': '',
            'error': 'An error occurred in loading the data.',
            'nodata': 'No data found.'
        },
        messages: {
            'selectField': 'Select Field'
        },
        loadingicon: '',
        startRowIndex: 1,
        editmode: '',
        actionsEnabled: {
            'edit': true,
            'new': true
        },
        rowExpansionEnabled: false,
        rowDef: {
            position: '0',
            closeothers: false,
            columnwidth: '50px'
        },
        summaryRow: false,
        summaryRowDefs: [],
        summaryRowDefsObject: [],
        searchHandler: function () {
        },
        sortHandler: function () {
        }
    },
    customColumnDefs: {
        'checkbox': {
            'field': 'checkbox',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'width: 50px; text-align: center;',
            'textAlignment': 'center',
            'isMultiSelectCol': true,
            'show': true,
            'multiselecttitle': '',
            'multiselectarialabel': ''
        },
        'radio': {
            'field': 'radio',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'width: 50px; text-align: center;',
            'textAlignment': 'center',
            'show': true,
            'radioselecttitle': '',
            'radioselectarialabel': ''
        },
        '__expand': {
            'field': '__expand',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'text-align: center;',
            'textAlignment': 'center',
            'show': true,
            'width': '50px'
        },
        'rowIndex': {
            'field': 'rowIndex',
            'type': 'custom',
            'displayName': 'S. No.',
            'sortable': false,
            'searchable': false,
            'selectable': false,
            'readonly': true,
            'style': 'text-align: left;',
            'textAlignment': 'left',
            'show': true
        }
    },
    CONSTANTS: {
        'QUICK_EDIT': 'quickedit',
        'INLINE': 'inline',
        'FORM': 'form',
        'DIALOG': 'dialog',
        'SEARCH': 'search',
        'MULTI_COLUMN': 'multicolumn'
    },
    Utils: {
        random: function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        },
        isDefined: function (value) {
            return value !== undefined;
        },
        isObject: function (value) {
            return value !== null && typeof value === 'object';
        },
        getObjectIndex: function (data, obj) {
            var matchIndex = -1;
            if (!Array.isArray(data)) {
                return -1;
            }
            data.some(function (data, index) {
                if (_.isEqual(data, obj)) {
                    matchIndex = index;
                    return true;
                }
            });
            return matchIndex;
        },
        generateGuid: function () {
            var random = this.random;
            return random() + random() + '-' + random() + '-' + random() + '-' +
                random() + '-' + random() + random() + random();
        },
        isValidHtml: function (htm) {
            var validHtmlRegex = /<[a-z][\s\S]*>/i;
            return validHtmlRegex.test(htm);
        },
        isMac: function () {
            return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        },
        isDeleteKey: function (event) {
            return (this.isMac() && event.which === 8) || event.which === 46;
        }
    },

    /**
     * used to parse styles expression and apply individual styles to a DOM node
     * this is done to mitigate CSP unsafe-inline policy on styles
     * @param $el
     * @param styleString
     * @returns {*}
     * @private
     */
    _setStyles: function($el, styleString) {
        if (!styleString) {
            return;
        }
        var styles = styleString.split(';');
        styles.forEach(function (styleBit) {
            var parts = styleBit.split(':');
            var property, value;
            if (parts.length === 2) {
                property = parts[0].trim();
                value = parts[1].trim();
                $el.css(property, value);
            }
        });
        return styleString;
    },

    _getColumnSortDirection: function (field) {
        var sortInfo = this.options.sortInfo;
        return field === sortInfo.field ? sortInfo.direction : '';
    },
    /*Based on the spacing property, add or remove classes*/
    _toggleSpacingClasses: function (value) {
        switch (value) {
            case 'normal':
                this.tableContainer.removeClass('table-condensed');
                if (this.gridSearch) {
                    this.gridSearch.find('.form-group').removeClass('form-group-sm');
                    this.gridSearch.find('select').removeClass('input-sm');
                    this.gridSearch.find('.input-group').removeClass('input-group-sm');
                }
                break;
            case 'condensed':
                this.tableContainer.addClass('table-condensed');
                if (this.gridSearch) {
                    this.gridSearch.find('.form-group').addClass('form-group-sm');
                    this.gridSearch.find('select').addClass('input-sm');
                    this.gridSearch.find('.input-group').addClass('input-group-sm');
                }
                break;
        }
    },
    //Method to calculate and get the column span of the header cells
    _getColSpan: function (cols) {
        var colSpan = 0,
            self = this;
        _.forEach(cols, function (col) {
            var colDef;
            if (col.isGroup) {
                colSpan += self._getColSpan(col.columns);
            } else {
                colDef = _.find(self.preparedHeaderData, {'field': col.field});
                //If show is false, don't increment the col span
                colSpan = (!_.isUndefined(colDef.show) && !colDef.show) ? colSpan : colSpan + 1;
            }
        });
        return colSpan;
    },
    //Method to set the column span of the header cells in the config
    _setColSpan: function (config) {
        var self = this;
        _.forEach(config, function (col) {
            if (col.isGroup) {
                col.colspan = self._getColSpan(col.columns);
                self.gridHeaderElement.find('th[data-col-group="' + col.field + '"]').attr('colspan', col.colspan);
                self._setColSpan(col.columns);
            }
        });
    },
    /* Returns the table header template. */
    _getHeaderTemplate: function () {

        var $colgroup = $('<colgroup></colgroup>'),
            $htm = this.gridHeaderElement.empty(),
            isDefined = this.Utils.isDefined,
            sortInfo = this.options.sortInfo,
            sortField = sortInfo.field,
            self = this,
            rowTemplates = [],
            headerConfig = this.options.headerConfig,
            headerGroupClass = self.options.cssClassNames.groupHeaderCell,
            $row;

        function generateHeaderCell(value, index) {
            var id = index,
                field = value.field,
                headerLabel = self.Utils.isDefined(value.displayName) ? value.displayName : (field || ''),
                titleLabel = headerLabel,
                sortEnabled = self.options.enableSort && (_.isUndefined(value.show) || value.show) && (_.isUndefined(value.sortable) || value.sortable),
                headerClasses = self.options.cssClassNames.headerCell,
                sortClass,
                tl = '',
                $th,
                $col,
                $sortSpan,
                $sortIcon;
            headerLabel = (!self.Utils.isDefined(headerLabel) || headerLabel === '') ? '&nbsp;' : headerLabel; //If headername is empty, add an empty space
            $col = $('<col/>');
            if (value.style) {
                self._setStyles($col, value.style);
            }
            $colgroup.append($col);
            /* thead */

            if (isDefined(value.class)) {
                headerClasses += ' ' + value.class;
            }
            if (value.selected) {
                headerClasses += ' ' + self.options.cssClassNames.selectedColumn + ' ';
            }
            if (field === 'checkbox' || field === 'radio') {
                headerClasses += ' grid-col-small';
            }
            tl += '<th';
            if ((_.isUndefined(value.resizable) || value.resizable) && (_.isUndefined(value.show) || value.show)) { //If show is false, do not add the resize option
                tl += ' data-col-resizable';
            }
            if (self.options.enableColumnSelection && (_.isUndefined(value.selectable) || value.selectable)) {
                tl += ' data-col-selectable';
            }
            if (sortEnabled) {
                tl += ' data-col-sortable';
            }
            tl += '></th>';
            $th = $(tl);
            $th.attr({
                'data-col-id': id,
                'data-col-field': field,
                'title': titleLabel,
                'tabindex': 0,
                'scope': 'col',
                'role':'columnheader'
            });
            self._setStyles($th, 'text-align: ' + value.textAlignment)
            $th.addClass(headerClasses);
            /* For custom columns, show display name if provided, else don't show any label. */
            if (field === 'checkbox') {
                $th.append(self._getCheckbox());
            }
            if (field === 'radio') {
                $th.attr('aria-label', "Select row");
            }
            $th.append('<span class="header-data">' + headerLabel + '</span>');
            if (sortEnabled) { //If sort info is present, show the sort icon for that column on grid render
                $sortSpan = $('<span class="sort-buttons-container"></span>');
                $sortIcon = $('<i class="sort-icon"></i>');
                if (sortField && sortField === value.field && sortInfo.direction) {
                    sortClass = sortInfo.direction === 'asc' ? self.options.cssClassNames.ascIcon : self.options.cssClassNames.descIcon;
                    $sortSpan.addClass('active');
                    $sortIcon.addClass(sortClass + ' ' + sortInfo.direction);
                }
                $th.append($sortSpan.append($sortIcon));
            }
            return $th;
        }

        //Method to generate the header row based on the column group config
        function generateRow(cols, i) {
            var $thList = [];
            _.forEach(cols, function (col) {
                var index,
                    value,
                    classes,
                    styles,
                    $groupTl;
                if (col.columns && col.columns.length) {
                    //If columns is present, this is a group header cell.
                    $groupTl = $('<th></th>');
                    classes = headerGroupClass + ' ' + (col.class || '');
                    styles = 'text-align: ' + col.textAlignment + ';background-color: ' + (col.backgroundColor || '') + ';';
                    $groupTl.attr({
                        'data-col-group': col.field,
                        'class': classes,
                        'title': col.displayName,
                        'tabindex': 0
                    });
                    self._setStyles($groupTl, styles);
                    $groupTl.append('<span class="header-data">' + col.displayName + '</span>');
                    $thList.push($groupTl);
                    generateRow(col.columns, (i + 1));
                } else {
                    //For non group cells, fetch the relative field definition and generate the template
                    index = _.findIndex(self.preparedHeaderData, {'field': col.field});
                    value = self.preparedHeaderData[index];
                    if (value) {
                        $thList.push(generateHeaderCell(value, index));
                    }
                }
            });
            rowTemplates[i] = rowTemplates[i] || [];
            rowTemplates[i] = rowTemplates[i].concat($thList);
        }

        //If header config is not present, this is a dynamic grid. Generate headers directly from field defs
        if (_.isEmpty(headerConfig)) {
            $row = $('<tr></tr>');
            self.preparedHeaderData.forEach(function (value, index) {
                $row.append(generateHeaderCell(value, index));
            });
            $htm.append($row);
        } else {
            generateRow(headerConfig, 0);
            //Combine all the row templates to generate the header
            rowTemplates.forEach(function($thList, index) {
                $row = $('<tr role="row" tabindex="0"></tr>');
                // To fix ADA issue "Tables headers in datatable must refer to data cells"
                var rowSpan = rowTemplates.length - index;
                //append all t-heads to the tr
                $thList.forEach(function($th) {
                    // if rowspan > 1, apply it to all non-group t-heads
                    if (rowSpan > 1 && $th.hasClass('app-datagrid-header-cell')) {
                        $th.attr('rowspan', rowSpan);
                    }
                    $row.append($th);
                });
                $htm.append($row);
            });
        }

        return {'colgroup': $colgroup, 'header': $htm};
    },

    /* Returns the seachbox template. */
    _getSearchEl: function () {
        var htm,
            sel = '<select name="wm-datatable" data-element="dgFilterValue" ' +
                'class="form-control app-select">' +
                '<option value="" selected class="placeholder">' + this.options.messages.selectField + '</option>',
            searchLabel = (this.Utils.isDefined(this.options.searchLabel) &&
                this.options.searchLabel.length) ? this.options.searchLabel : '';
        this.options.colDefs.forEach(function (colDef, index) {
            if (colDef.field !== 'none' && colDef.field !== 'rowOperations' && colDef.searchable && _.toString(colDef.showinfilter) !== 'false') {
                sel += '<option value="' + colDef.field +
                    '" data-coldef-index="' + index + '">' +
                    (colDef.displayName || colDef.field) + '</option>';
            }
        });

        sel += '</select>';
        htm =
            '<form class="form-search form-inline" onsubmit="return false;"><div class="form-group">' +
            '<input type="text" data-element="dgSearchText" class="form-control app-textbox" value="" placeholder="' + searchLabel + '"/>' +
            '</div><div class="input-append input-group">' +
            sel +
            '<span class="input-group-addon"><button type="button" data-element="dgSearchButton" class="app-search-button" title="' + searchLabel + '">' +
            '<i class="wi wi-search"></i>' +
            '</button></span>' +
            '</div>' +
            '</div></form>';
        var $htm = $(htm);
        this._setStyles($htm.find('[data-element="dgSearchText"]'), "display: inline-block;");
        return $htm;
    },
    _appendRowExpansionButtons: function ($htm) {
        var self = this;
        $htm.find("[data-identifier='rowExpansionButtons']").each(function (index) {
            var _rowData, $row, rowId, rowIndex = index;
            $row = $(this).closest('tr.app-datagrid-row');
            rowId = parseInt($row.attr('data-row-id'), 10);
            _rowData = _.clone(self.options.data[rowId]);
            _rowData.$index = rowIndex + 1;
            self.options.generateRowExpansionCell(_rowData, rowIndex);
            $(this).empty().append(self.options.getRowExpansionAction(rowIndex));
            var expandtitleExpr = $(this).children()[0].getAttribute('expandtitle.bind'),
                collapsetitleExpr = $(this).children()[0].getAttribute('collapsetitle.bind');

            if(expandtitleExpr) {
                self.options.registerCollapseOrExpandTitleWatch(expandtitleExpr, _rowData, rowIndex, "expandtitle", $(this).children()[0]);
            }
            if(collapsetitleExpr) {
                self.options.registerCollapseOrExpandTitleWatch(collapsetitleExpr, _rowData, rowIndex, "collapsetitle", $(this).children()[0]);
            }

        });
    },

    setSummaryRowDef: function (key, data, rowIndex, refreshIndicator) {
        this.options.summaryRow = true;
        if (this.options.summaryRowDefs[rowIndex] == undefined) {
            this.options.summaryRowDefs[rowIndex] = {};
            this.options.summaryRowDefsObject[rowIndex] = {};
        }
        this.options.summaryRowDefsObject[rowIndex][key] = data;
        this.options.summaryRowDefs[rowIndex][key] = (data && data.value) ? data.value : data;
        if (refreshIndicator) this.refreshGridData();
    },

    /* Returns the tbody markup. */
    _getSummaryRowTemplate: function () {
        var self = this,
            $tfoot = $('<tfoot class="' + this.options.cssClassNames.gridFooter + '"></tfoot>');
        this._setStyles($tfoot, "border-top: 3px solid #eee;");

        _.forEach(this.options.summaryRowDefs, function (row, index) {
            row.$$pk = index;
            $tfoot.append(self._getRowTemplate(row, index, true));
        });

        return $tfoot;
    },


    /* function to get start index of the current active page */
    getPageStartIndex: function() {
        var currentPage = this.options.getCurrentPage(), pagesize = this.options.getPageSize();
        var isPrevPageUpdated = this.options.actionRowPage < currentPage;
        var pageIndex = isPrevPageUpdated ? this.options.actionRowPage : currentPage;
        return ((pageIndex - 1) * pagesize);
    },

    /*
        function which filters the Prepared Data list and remove the rowdata if it is already present in the table
     */
    _getPreparedDataForInfiniteScroll : function ($tbody, preparedData) {
        preparedData = preparedData.filter(function(row, index) {
            var isExists = $tbody.find('tr.app-datagrid-row[data-row-id=' + row.$$pk + ']');
            if (!isExists.length) { return row;}
        })
        return preparedData;
    },

    // when the edit action is performed, update the tr with the new data
    _updateTrData : function ($tbody) {
        var  editedRow,updatedRowData, self = this;
        editedRow = $tbody.find('tr.app-datagrid-row[data-row-id=' + self.options.actionRowIndex + ']');
        updatedRowData = self.preparedData[self.options.actionRowIndex];
        self.options.generateCustomExpressions(updatedRowData, self.options.actionRowIndex);
        var rowTemplate = self._getRowTemplate(updatedRowData, self.options.actionRowIndex);
        editedRow.replaceWith(rowTemplate[0]);
    },

    /*
        handles the edit, search-sort operations performed on table with pagination type infinite scroll or On-demand
        -> when search-sort is performed, clear the tbody
        -> when the edit is performed update the tr with newly updated data
     */
    _handleCRUDForInfiniteScroll : function ($tbody) {
        var self = this;

        //When search or sort applied or dataset is updated, clear the tbody and render with filtered data
        // Fix for [WMS-23263] 'isDataUpdatedByUser' flag is true when dataset is updated from script
        if ((self.options.lastActionPerformed === self.options.ACTIONS.SEARCH_OR_SORT || self.options.lastActionPerformed === self.options.ACTIONS.FILTER_CRITERIA || self.options.lastActionPerformed === self.options.ACTIONS.DATASET_UPDATE) && (self.options.isSearchTrigerred || self.options.isDatasetUpdated || self.options.isDataUpdatedByUser)) {
            $tbody.html('');
            // In case of on demand pagination, when the next page is not disabled show the loading/load more button accordingly
            if(this.options.navigation === 'On-Demand' && !this.options.isLastPage)
                this.element.find('.on-demand-datagrid').show();
            // Fix for [WMS-22904]- clearing customExpr and RowDetailExpr whenever tbody content is cleared
            self.options.clearCustomExpression();
            self.options.clearRowDetailExpression();
            self.options.setIsSearchTrigerred(false);
            self.options.setIsDatasetUpdated(false);
        }

        //In edit mode, replace the tr with newly updated values
        else if (self.options.lastActionPerformed === self.options.ACTIONS.EDIT && self.options.actionRowIndex !== undefined && self.options.editmode !== this.CONSTANTS.QUICK_EDIT) {
            self._updateTrData($tbody);
        }
    },

    /* Returns the tbody markup. */
    _getGridTemplate: function () {

        var self = this, preparedData,$tbody,pageStartIndex = self.getPageStartIndex(),
            startRowIndex = self.options.startRowIndex,
            isScrollorOnDemand = self.options.isNavTypeScrollOrOndemand();
            if(isScrollorOnDemand) {
                $tbody = this.gridElement;
                if(this.renderTableOnViewLess) {
                    $tbody = this.gridElement.empty();
                    this.hideLoadingIndicator();
                   // this.addNavigationControls();
                    this.renderTableOnViewLess = false;
                }
            } else {
                $tbody = this.gridElement.empty();
            }

        if(isScrollorOnDemand) {
            this._handleCRUDForInfiniteScroll($tbody);
            //Increment the startRowIndex, when delete action is prformed.
            if (self.options.lastActionPerformed === self.options.ACTIONS.DELETE) {
                startRowIndex = self.options.actionRowIndex + 1;
            }
            preparedData = this._getPreparedDataForInfiniteScroll($tbody, this.preparedData.slice(pageStartIndex));
        } else {
            // if navigation type is not scroll or on-Demand then clear CustomExpressions and RowDetailExpression
            // as the expressions will be generated again
            this.options.clearCustomExpression();
            this.options.clearRowDetailExpression();
            preparedData = this.preparedData;
        }
        _.forEach(preparedData, function (row, index) {
            var _row = _.clone(row), rowIndex = (isScrollorOnDemand) ? startRowIndex + index - 1 : index, rowTemplate;
            _row.$index = rowIndex + 1;
            self.options.generateCustomExpressions(_row, rowIndex);
            self.options.registerRowNgClassWatcher(_row, rowIndex);
            rowTemplate = self._getRowTemplate(row, rowIndex);
            $tbody.append(rowTemplate);
            if (self.options.rowExpansionEnabled) {
                var rowHeight = self.options.rowDef.height;
                var colSpanLength = _.filter(self.preparedHeaderData, function(c) {return c.show}).length;
                var $tr = $('<tr class="app-datagrid-detail-row" tabindex="0" role="row" data-row-id="' + row.$$pk + '"><td colspan="' + colSpanLength + '" class="app-datagrid-row-details-cell">' +
                    '<div class="row-overlay"><div class="row-status"><i class="' + self.options.loadingicon + '"></i></div></div><div class="details-section"></div>' +
                    '</td></tr>');
                if (rowHeight) {
                    $tr.find('div.row-overlay').css('min-height', rowHeight);
                }
                $tr.css('display', 'none')
                $tr.find('.details-section').css('display', 'none');
                $tbody.append($tr);
            }
        });
        // set last action performed to default and clear action row index, after generating templates
        // Fix for [WMS-23263] For Dynamic table _getGridTemplate() is being called twice
        // so reset the lastActionPerformed flag if it is not dynamic table
        if (!this.options.isdynamictable) {
            this.options.setLastActionPerformed(this.options.ACTIONS.DEFAULT);
            this.options.setIsDataUpdatedByUser(false);
            this.options.clearActionRowIndex();
        }
        return $tbody;
    },

    /* Returns the table row template. */
    _getRowTemplate: function (row, rowIndex, summaryRow) {
        var $htm,
            self = this,
            gridOptions = self.options;

        $htm = $('<tr role="row" tabindex="0" class="' + gridOptions.cssClassNames.tableRow + ' ' + (gridOptions.rowClass || '') + '" data-row-id="' + row.$$pk + '"></tr>');
        this.preparedHeaderData.forEach(function (current, colIndex) {
            $htm.append(self._getColumnTemplate(row, colIndex, current, rowIndex, summaryRow));
        });
        return $htm;
    },

    _getRowActionsColumnDefIndex: function () {
        var i, len = this.preparedHeaderData.length;
        for (i = 0; i < len; i += 1) {
            if (this.preparedHeaderData[i].field === 'rowOperations') {
                return i;
            }
        }
        return -1;
    },

    _getRowActionsColumnDef: function () {
        var index = this._getRowActionsColumnDefIndex();
        if (index !== -1) {
            return this.preparedHeaderData[index];
        }
        return null;
    },

    /* Returns the checkbox template. */
    _getCheckboxTemplate: function (row, isMultiSelectCol) {
        var checked = row._checked === true ? ' checked' : '',
            disabled = row.disabed ? ' disabled' : '',
            chkBoxName = isMultiSelectCol ? 'gridMultiSelect' : '',
            labelClass = row._checked === true ? '' : 'unchecked';

        return this._getCheckbox(labelClass, chkBoxName, checked, disabled);
    },

    /* Return checkbox literal */
    _getCheckbox: function (labelClass = '', chkBoxName = '', checked = '', disabled = '') {
        return `<div class="app-checkbox checkbox">
        <label class="${labelClass}">
            <span class="sr-only" aria-live="assertive">${this._getCheckboxLabel(chkBoxName)}</span>
            <input type="checkbox" name="${chkBoxName}" ${checked} ${disabled} role="checkbox">
            <span class="caption"></span>
        </label>
    </div>`
    },

    _getCheckboxLabel: function (chkBoxName) {
        if (chkBoxName) { // it is a row
            return 'Select row';
        } else {
            return 'Select all rows';
        }
    },
    /* Returns the radio template. */
    _getRadioTemplate: function (row) {
        var checked = row._checked === true ? ' checked' : '',
            disabled = row.disabed ? ' disabled' : '';
        return `<div class="radio app-radio">
            <label>
                <input type="radio" rowSelectInput name="" value="" ${checked} ${disabled}>
                <span class="caption"></span>
            </label>
        </div>`;
    },

    /* Returns the table cell template. */
    _getColumnTemplate: function (row, colId, colDef, rowIndex, summaryRow) {
        var $htm,
            columnValue,
            columnValueObject,
            cellPreloader = '<div class="overlay"><span aria-hidden="true" class="form-field-spinner fa fa-circle-o-notch fa-spin form-control-feedback"></span></div>',
            customExpressionHtml,
            innerTmpl,
            classes = this.options.cssClassNames.tableCell + ' ' + (colDef.class || ''),
            colExpression = colDef.customExpression,
            styles = "text-align: " + colDef.textAlignment + ";position: relative;"

        $htm = $('<td class="' + classes + '" data-col-id="' + colId + '" role="cell" tabindex="0"></td>');
        this._setStyles($htm, styles);

        columnValue = _.get(row, colDef.field);

        if (summaryRow) {
            columnValueObject = this.options.summaryRowDefsObject[rowIndex][colDef.field];
            if (columnValueObject instanceof Object) {
                if (columnValueObject.class) {
                    $htm.addClass(columnValueObject.class);
                }
            }

            if (columnValue instanceof Promise) {
                customExpressionHtml = cellPreloader;
                $htm.html(customExpressionHtml);
            } else {
                innerTmpl = (_.isUndefined(columnValue) || columnValue === null) ? '' : columnValue;
                $htm.html(innerTmpl);
            }
        } else if (colExpression) {
            $htm.html(this.options.getCustomExpression(colDef.field, rowIndex));
        } else {
            if (colDef.type !== 'custom') {
                columnValue = _.get(row, colDef.field);
                /* 1. Show "null" values as null if filterNullRecords is true, else show empty string.
                * 2. Show "undefined" values as empty string. */
                if ((this.options.filterNullRecords && columnValue === null) ||
                    _.isUndefined(columnValue)) {
                    columnValue = '';
                }
                $htm.attr('title', columnValue);
                //Add empty quote, to convert boolean false to 'false', so that value is rendered
                $htm.text("" + columnValue);
            } else {
                switch (colDef.field) {
                    case 'checkbox':
                        if(Array.isArray(this.options.multiselecttitle)) {
                            $htm.attr('title',this.options.multiselecttitle[row.$$index-1])
                        } else{
                            $htm.attr('title',this.options.multiselecttitle);
                        }
                        if(Array.isArray(this.options.multiselectarialabel)) {
                            $htm.attr('aria-label',this.options.multiselectarialabel[row.$$index-1])
                        } else{
                            $htm.attr('aria-label',this.options.multiselectarialabel);
                        }
                        innerTmpl = this._getCheckboxTemplate(row, colDef.isMultiSelectCol);
                        break;
                    case '__expand':
                        innerTmpl = '<span class="row-expansion-column" data-identifier="rowExpansionButtons"></span>';
                        break;
                    case 'radio':
                        if(Array.isArray(this.options.radioselecttitle)) {
                            $htm.attr('title',this.options.radioselecttitle[row.$$index-1])
                        } else{
                            $htm.attr('title',this.options.radioselecttitle);
                        }
                        if(Array.isArray(this.options.radioselectarialabel)) {
                            $htm.attr('aria-label',this.options.radioselectarialabel[row.$$index-1])
                        } else{
                            $htm.attr('aria-label',this.options.radioselectarialabel);
                        }
                        innerTmpl = this._getRadioTemplate(row);
                        break;
                    case 'rowOperations':
                        innerTmpl = '<span class="actions-column" data-identifier="actionButtons"></span>';
                        break;
                    case 'rowIndex':
                        innerTmpl = row.$$index;
                        break;
                    case 'none':
                        innerTmpl = '';
                        break;
                    default:
                        innerTmpl = (_.isUndefined(columnValue) || columnValue === null) ? '' : columnValue;
                }
                $htm.html(innerTmpl);
            }
        }
        row.$index = rowIndex + 1;
        this.options.registerColNgClassWatcher(row, colDef, rowIndex, colId, summaryRow);
        return $htm;
    },
    //Get event related template for editable widget
    _getEventTemplate: function (colDef) {
        var events = _.filter(_.keys(colDef), function (key) {
                return _.startsWith(key, 'on');
            }),
            changeEvt,
            template = '';
        //On change events for the widget
        changeEvt = colDef.editWidgetType === 'autocomplete' ? 'onSubmit' : 'onChange';
        events = _.union(events, [changeEvt]);
        _.forEach(events, function (eventName) {
            template += ' ' + _.kebabCase(eventName) + '="';
            if (eventName === 'onSubmit' || eventName === 'onChange') {
                template += '_' + eventName + 'Field($event, $scope, newVal, oldVal);'
            }
            template += (colDef[eventName] || '') + '" ';
        });
        return template;
    },
    _insertFieldInHeaderConfig: function (headerConfig, fieldName, position) {
        var index = _.findIndex(headerConfig, {field: position}),
            self = this;
        if (index === -1) {
            _.forEach(headerConfig, function (config) {
                if (config.isGroup) {
                    self._insertFieldInHeaderConfig(config.columns, fieldName, position);
                }
            });
        } else {
            headerConfig.splice(index + 1, 0, {'field': fieldName, 'isPredefined': true});
        }
    },
    setHeaderConfigForDefaultFields: function (name, position) {
        if (_.isEmpty(this.options.headerConfig)) {
            return;
        }
        var fieldName = this.customColumnDefs[name].field;
        _.remove(this.options.headerConfig, {'field': fieldName});
        if (position === '0') {
            this.options.headerConfig.unshift({'field': fieldName, 'isPredefined': true});
        } else  if (position === '-1') {
            this.options.headerConfig.push({'field': fieldName, 'isPredefined': true});
        } else {
            this._insertFieldInHeaderConfig(this.options.headerConfig, fieldName, position);
        }
    },
    setDefaultColsData: function (header) {
        //If columns are not present, do not add the default columns
        if (_.isEmpty(this.preparedHeaderData)) {
            return;
        }
        var rowExpandPosition,
            rowExpandCol;
        if (this.options.rowExpansionEnabled) {
            rowExpandPosition = this.options.rowDef.position;
            rowExpandCol = _.clone(this.customColumnDefs.__expand);
            rowExpandCol.width = this.options.rowDef.columnwidth;
            if (header) {
                if (rowExpandPosition === '-1') {
                    this.preparedHeaderData.push(rowExpandCol);
                } else if (rowExpandPosition === '0') {
                    this.preparedHeaderData.unshift(rowExpandCol);
                } else {
                    var index = _.findIndex(this.preparedHeaderData, {field: rowExpandPosition});
                    this.preparedHeaderData.splice(index + 1, 0, rowExpandCol);
                }
            }
            this.setHeaderConfigForDefaultFields('__expand', rowExpandPosition);
        }
        if (this.options.showRowIndex) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.rowIndex);
            }
            this.setHeaderConfigForDefaultFields('rowIndex', '0');
        }
        if (this.options.multiselect) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.checkbox);
            }
            this.setHeaderConfigForDefaultFields('checkbox', '0');
        }
        if (!this.options.multiselect && this.options.showRadioColumn) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.radio);
            }
            this.setHeaderConfigForDefaultFields('radio', '0');
        }
    },
    /* Prepares the grid header data by adding custom column definitions if needed. */
    _prepareHeaderData: function () {
        this.preparedHeaderData = [];

        $.extend(this.preparedHeaderData, this.options.colDefs);
        this.setDefaultColsData(true);
    },

    /* Generates default column definitions from given data. */
    _generateCustomColDefs: function () {
        var colDefs = [],
            generatedColDefs = {};

        function generateColumnDef(key) {
            if (!generatedColDefs[key]) {
                var colDef = {
                    'type': 'string',
                    'field': key
                };
                colDefs.push(colDef);
                generatedColDefs[key] = true;
            }
        }

        this.options.data.forEach(function (item) {
            _.keys(item).forEach(generateColumnDef);
        });

        this.options.colDefs = colDefs;
        this._prepareHeaderData();
    },

    /* Prepares the grid data by adding a primary key to each row's data. */
    _prepareData: function () {
        var data = [],
            colDefs = this.options.colDefs,
            self = this,
            gridData = [],
            pageStartIndex = self.getPageStartIndex(),
            isObject = this.Utils.isObject,
            isDefined = this.Utils.isDefined;
        if (!this.options.colDefs.length && this.options.data.length) {
            this._generateCustomColDefs();
        }
        gridData = this.options.isNavTypeScrollOrOndemand() ? this.options.data.slice(pageStartIndex) : this.options.data;
        gridData.forEach(function (item, i) {
            var rowData = $.extend(true, {}, item);
            colDefs.forEach(function (colDef) {
                if (!colDef.field) {
                    return;
                }
                var fields = colDef.field.split('.'),
                    text = item,
                    j,
                    len = fields.length,
                    key,
                    isArray;

                for (j = 0; j < len; j++) {
                    key = fields[j];
                    isArray = undefined;
                    if (key.indexOf('[0]') !== -1) {
                        key = key.replace('[0]', '');
                        isArray = true;
                    }
                    if (isObject(text) && !isArray) {
                        text = _.get(text, key);
                    } else if (isArray) {
                        text = _.get(text, key + '[0]');
                    } else {
                        text = undefined;
                        break;
                    }
                }
                if (isDefined(text)) {
                    rowData[colDef.field] = text;
                } else if (fields.length > 1 && _.has(item, colDef.field)) {
                    /* For case when coldef field name has ".", but data is in
                     * format [{'foo.bar': 'test'}], i.e. when the key value is
                     * not a nested object but a primitive value.
                     * (Ideally if coldef name has ".", for e.g. field name 'foo.bar',
                     * data should be [{'foo': {'bar': 'test'}})*/
                    rowData[colDef.field] = item[colDef.field];
                }
            });

            /* Add a unique identifier for each row. */
            rowData.$$index = pageStartIndex + i + 1;
            rowData.$$pk = (self.options.isNavTypeScrollOrOndemand()) ? (pageStartIndex + i ) : i;
            data.push(rowData);
        });
        if (self.options.isNavTypeScrollOrOndemand()) {
            // If search action is performed or dataset is updated, then directly assign data to preparedData
            if((self.options.isSearchTrigerred && !self.emptySearch) || self.options.isDatasetUpdated){
                self.preparedData = data;
            }
            // else update the existing data (if any edit action is performed) or push data (if the data is not present) to preparedData list.
            else if (self.preparedData.length) {
                data.forEach(function (rowData, index) {
                    var rowId = pageStartIndex + index;
                    // assigning updated value to prepareData list
                    if (self.preparedData[rowId] && rowData.$$index === self.preparedData[rowId].$$index) {
                        self.preparedData[rowId] = rowData;
                    } else {
                        // appending new values to preparedData
                        self.preparedData.push(rowData);
                    }
                })
            } else {
                // if there is no preparedData initially then push data to preparedData list
                self.preparedData.push(...data);
            }
        } else {
            self.preparedData = data;
        }
    },

    /* Select previously selected columns after refreshing grid data. */
    _reselectColumns: function () {
        var selectedColumns = [],
            self = this;
        //If enableColumnSelection is set to true, reselect the columns on data refresh
        if (this.gridHeaderElement && this.options.enableColumnSelection) {
            selectedColumns = this.gridHeaderElement.find('th.' + this.options.cssClassNames.selectedColumn);
            //Call the column selection handler on each of the selected columns
            if (selectedColumns.length) {
                selectedColumns.each(function () {
                    self.columnSelectionHandler(undefined, $(this));
                });
            }
        }
        //reset select all checkbox.
        if (this.options.multiselect) {
            this.updateSelectAllCheckboxState();
        }
    },

    /* Initializes the grid. */
    _create: function () {
        // Add all instance specific values here.
        $.extend(this, {
            dataStatus: {
                'message': '',
                'state': 'ready'
            },
            preparedData: [],
            preparedHeaderData: [],
            dataStatusContainer: null,
            gridContainer: null,
            gridElement: null,
            gridHeader: null,
            gridBody: null,
            columnClickInfo: {},
            gridFooter: null,
            gridSearch: null,
            tableId: null,
            searchObj: {
                'field': '',
                'value': '',
                'event': null
            },
            compiledCellTemplates: {}
        });
        // TODO: Variable loading status is getting updated before dataset update. This is resulting in loader going off before data is rendered.
        // Need to update code with suitable fix. For now 250ms is added as workaround
        this._setStatus = _.debounce(function (isCreated) {
            this.__setStatus(isCreated);
        }, 100);
        this._debounceOnEnter = _.debounce(function ($target, $row, quickEdit, event) {
            this._onEnter($target, $row, quickEdit, event);
        }, 150);
        this.options.summaryRow = false;
        this.options.summaryRowDefs = [];
        this._prepareHeaderData();
        this._prepareData();
        this._render(true);
    },
    _setGridEditMode: function (val) {
        if (_.isFunction(this.options.setGridEditMode)) {
            this.options.setGridEditMode(val);
        }
    },
    /* Re-renders the whole grid. */
    _refreshGrid: function () {
        this._prepareHeaderData();
        this._prepareData();
        this._render();
        this.addOrRemoveScroll();
        this._setGridEditMode(false);
    },

    refreshGrid: function () {
        window.clearTimeout(this.refreshGridTimeout);
        this.refreshGridTimeout = window.setTimeout(this._refreshGrid.bind(this), 50);
    },
    /* Function to call the renderGrid method for infinite scroll pagination type
    * Remove the markup of grid-footer and always-new-row
    * */
    callRenderGridForInfiniteScroll: function() {
        this.gridFooter.remove();
        var $alwaysNewRow = this.gridElement.find('> tr.app-datagrid-row.always-new-row');
        if ($alwaysNewRow.length) {
            $alwaysNewRow.remove();
        }
        this._renderGrid(undefined);
    },
    /* Re-renders the table body. */
    refreshGridData: function () {
        this._prepareData();
        //If the pagination type is not Infinite Scroll or On-demand, remove the tbody and footer
        if (!this.options.isNavTypeScrollOrOndemand()) {
            this.gridFooter.remove();
            this._renderGrid();
        } else {
            this.callRenderGridForInfiniteScroll();
        }
        this._reselectColumns();
        this.addOrRemoveScroll();
        this._setGridEditMode(false);
        this.toggleNewRowActions(false);
    },
    //Populate row data with default data
    setDefaultRowData: function (rowData) {
        _.forEach(this.preparedHeaderData, function (colDef) {
            rowData[colDef.field] = colDef.defaultvalue;
        });
    },
    /* Inserts a new blank row in the table. */
    addNewRow: function (skipFocus, alwaysNewRow) {
        var rowId = this.gridElement.find('> tr.app-datagrid-row:visible').length || 99999, //Dummy value if rows are not there
            self = this,
            rowData = {},
            $row,
            $gridBody,
            $alwaysNewRow;

        if (!alwaysNewRow && _.isFunction(this.options.beforeRowInsert)) {
            this.options.beforeRowInsert();
        }

        $gridBody = this.gridElement;
        $alwaysNewRow = $gridBody.find('> tr.app-datagrid-row.always-new-row');
        //Focus the new row if already present
        if ($alwaysNewRow.length) {
            this.setFocusOnElement(undefined, $alwaysNewRow);
            // QUICK EDIT MODE | On Add Click on new row, trigger save action
            if(this.options.editmode===this.CONSTANTS.QUICK_EDIT){
                var $qTarget = $alwaysNewRow.find("input").length>0?$($alwaysNewRow.find("input")[0]):null;
                if($qTarget!==null){
                    var event = $.Event("keydown");
                    event.which = 13;
                    $qTarget.trigger(event);
                }
            }
            return;
        }

        rowData.$index = rowId;
        rowData.$$pk = rowId;
        if (this.options.editmode !== this.CONSTANTS.FORM && this.options.editmode !== this.CONSTANTS.DIALOG) {
            $row = $(this._getRowTemplate(rowData, rowData.$index));
            if (!this.preparedData.length) {
                this.setStatus('ready', this.dataStatus.ready);
            }
            //Based on the form position, add new row at top or bottom
            if (this.options.formPosition === 'top') {
                $gridBody.prepend($row);
            } else {
                $gridBody.append($row);
            }
            this._appendRowActions($row, true, rowData);
            this.attachEventHandlers($row);
            //For quick edit, do not remove the delete button
            if (alwaysNewRow || this.options.editmode !== this.CONSTANTS.QUICK_EDIT) {
                $row.find('.delete-row-button').hide();
                //Hide the edit button for always new row
                if (alwaysNewRow) {
                    $row.find('.edit-row-button').hide()
                }
            }
            this._findAndReplaceCompiledTemplates();

            //For always show new row, make the row editable with default values
            if (alwaysNewRow) {
                this.setDefaultRowData(rowData);

                $row.addClass('always-new-row').addClass('row-editing');
                this.options.runInNgZone(function () {
                    self.makeRowEditable($row, rowData, true);
                });
            } else {
                $row.trigger('click', [undefined, {action: 'edit', operation: 'new', skipFocus: skipFocus}]);
            }

            this.updateSelectAllCheckboxState();
            this.addOrRemoveScroll();
            this.options.timeoutCall(function () {
                self.setColGroupWidths();
            }, 100);
        }
    },

    /* Inserts a load more button at the end of the table when the pagination selected is on demand */
    addLoadMoreBtn : function (onDemandMsg, loadingdatamsg, cb, infScroll) {
        // Show Load more button only if it not the last page
        var $btnEl;
        if (!this.options.isLastPage || infScroll) {
            var self = this;
            var $parenEl = $('<div class="on-demand-datagrid"><a class="app-button btn btn-block on-demand-load-btn"></a></div>');
            $btnEl = $parenEl.find('a');
            $btnEl.append(onDemandMsg);
            // Adding load more button in case of on demand pagination
            this.element.find('.app-grid-header-inner').append($parenEl);
            if(infScroll) {
                if(this.element.find('.on-demand-load-btn').length) {
                    this.element.find('.on-demand-load-btn').text(this.options.viewlessmessage);
                }
            }

            // Adding click event to the button
            $btnEl.on('click', function (e) {
                // when the button is clicked, hide the button and show loading indicator
                var lastPage = (self.options.getCurrentPage() == self.options.getPageCount());
                if(!lastPage) {
                    self.showLoadingIndicator(loadingdatamsg, false);
                }
                if(!self.options.showviewlessbutton){
                    $btnEl.hide();
                }
                if(infScroll) {
                    if(lastPage) {
                        self.element.find('.on-demand-datagrid').remove();
                    }
                }
                // Fix for [WMS-23839] refresh data when clicked on View less button
                if (lastPage && self.options.showviewlessbutton) {
                         $btnEl.hide();
                         self.renderTableOnViewLess = true;
                         self.renderPaginationOnViewLess = true;
                         self.options.enableNavigation();
                         self._renderGrid();
                }
                if (cb && typeof cb === 'function') {
                    cb(e);
                }

            });
        }

    },

    /* Shows loading indicator when clicked on load more button or in case of infinite scroll event is triggered */
    showLoadingIndicator: function (loadingdatamsg, infScroll) {
        var hasLoadingEl = this.element.find('.loading-data-msg');
        var $dataGrid = this.element.find('.on-demand-datagrid');
        if (hasLoadingEl.length && !infScroll) {
            // in case of on demand pagination, show the loading ele which was hidden
            hasLoadingEl.show();
        } else if (infScroll && $dataGrid.length) {
            // in case of infinite scroll show the demand-grid ele which was hidden
            $dataGrid.show();
        } else {
            // if the loading indicator ele is not created, create it and append it to grid ele if it is already present.
            // If not create grid ele and then append the loading indicator to grid ele
            var $loadingEl = $('<div class="loading-data-msg spin-icon-in-center"><span><i class="app-icon panel-icon fa-spin ' + this.options.loadingicon + '"></i>' +
                '<span class="sr-only">Loading</span><span class="loading-text"></span></span></div>');
            $loadingEl.find('.loading-text').html(loadingdatamsg);
            if ($dataGrid.length) {
                $dataGrid.append($loadingEl);
            } else {
                var gridEl = $('<div class="on-demand-datagrid">' + $loadingEl[0].outerHTML + '</div>');
                this.element.find('.app-grid-header-inner').append(gridEl);
            }
        }
    },

    /* Hides loading indicator and shows load more button */
    hideLoadingIndicator: function (showLoadBtn, infScroll) {
        if (!showLoadBtn && !infScroll) {
            // In case of on demand pagination, when the next page is not disabled hide the individual elements
            this.element.find('.loading-data-msg').hide();
            this.element.find('.on-demand-load-btn').text(this.options.ondemandmessage);
            this.element.find('.on-demand-load-btn').show();
        } else if((this.options.getCurrentPage() == this.options.getPageCount()) && this.options.showviewlessbutton) {
                this.element.find('.on-demand-load-btn').show().text(this.options.viewlessmessage);
                this.element.find('.loading-data-msg').hide();
                if(infScroll) {
                    if(!this.element.find('.on-demand-load-btn').length) {
                        this.options.addLoadMoreBtn();
                    }
                    this.element.find('.loading-data-msg').hide();
                }
        } else {
                this.element.find('.on-demand-datagrid').hide();
        }
    },

    /* Returns the selected rows in the table. */
    getSelectedRows: function () {
        this.getSelectedColumns();
        var selectedRowsData = [],
            self = this;

        this.preparedData.forEach(function (data, i) {
            if (data._selected) {
                selectedRowsData.push(self.options.data[i]);
            }
        });
        return selectedRowsData;
    },
    /* Sets the selected rows in the table. */
    selectRows: function (rows) {
        var self = this;
        var _rows = _.isArray(rows) ? rows.slice() : [rows];
        /*Deselect all the previous selected rows in the table*/
        self.gridElement.find('tr.app-datagrid-row').each(function (index) {
            if (self.preparedData[index] && self.preparedData[index]._selected === true) {
                $(this).trigger('click', [$(this), {skipSingleCheck: true}]);
            }
        });
        /*Select the given row. If rows is an array, loop through the array and set the row*/
        if (_.isArray(_rows)) {
            _.forEach(_rows, function (row) {
                self.selectRow(row, true);
            });
        } else {
            self.selectRow(_rows, true);
        }
    },
    toggleRowFilter: function(show) {
        if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN && this.gridSearch) {
            if (show) {
                this.gridSearch.show();
            } else {
                this.gridSearch.hide();
            }
        }
    },
    /*Set the default widths for the colgroup*/
    setColGroupWidths: function () {
        var self = this,
            headerCols = this.options.isMobile ? this.tableContainer.find('col') : this.tableContainer.find('col'),
            bodyCols = this.tableContainer.find('col'),
            headerCells = this.options.showHeader ? this.gridContainer.find('th.app-datagrid-header-cell') : this.gridElement.find('tr.app-datagrid-row').first().find('td'),
            colLength = this.preparedHeaderData.length,
            scrollLeft = this.gridElement.parent().prop('scrollLeft'); //Preserve the scroll left to keep the same scroll after setting width
        if (!headerCols.length && !headerCells.length) {
            return;
        }
        //Set the col spans for the header groups
        this._setColSpan(this.options.headerConfig);
        // Hide the row filter. As different widgets are present inside row filter, this will effect the column size
        this.toggleRowFilter();

        // Find if cols of colgroup has any width defined, if yes remove those columns from colsLen
        var definedColWidth = 0;
        var colsLen = headerCols.length;
        headerCols.each(function () {
            var eachColWidth = $(this).width();
            if (eachColWidth) {
                definedColWidth = definedColWidth + eachColWidth;
                colsLen =  colsLen - 1;
            }
        });


        //First Hide or show the column based on the show property so that width is calculated correctly
        headerCells.each(function () {
            var id = Number($(this).attr('data-col-id')),
                colDef = self.preparedHeaderData[id],
                $headerCell = self.gridContainer.find('th[data-col-id="' + id + '"]'),
                $tdCell = self.gridElement.find('td.app-datagrid-cell[data-col-id="' + id + '"]'),
                $footCell=self.tableContainer.find('tfoot tr.app-datagrid-row td.app-datagrid-cell[data-col-id="' + id + '"]'),
                $headerCol = $(headerCols[id]),
                $bodyCol = $(bodyCols[id]),
                definedWidth,
                width;
            if (!colDef) {
                return;
            }
            definedWidth = colDef.width;
            if (!_.isUndefined(colDef.show) && !colDef.show) { //If show is false, set width to 0 to hide the column
                //Hide the header and column if show is false
                $headerCell.hide();
                $tdCell.hide();
                $headerCol.hide();
                $bodyCol.hide();
                $footCell.hide();
            } else {
                $headerCell.show();
                $tdCell.show();
                $headerCol.show();
                $bodyCol.show();
                $footCell.show();
            }
            //If default width is set, reset the width so that correct width is set on reload
            if ($headerCol.length && $headerCol[0].style.width === '90px') {
                width = _.isUndefined(definedWidth) ? '' : definedWidth;
                $headerCol.css('width', width);
                $bodyCol.css('width', width);
            }
        });
        //setting the header col width based on the content width
        headerCells.each(function () {
            var $header = $(this),
                id = Number($header.attr('data-col-id')),
                colDef = self.preparedHeaderData[id],
                definedWidth,
                width,
                tempWidth,
                $headerCol;
            if (!colDef) {
                return;
            }
            definedWidth = colDef.width;
            if (!_.isUndefined(colDef.show) && !colDef.show) { //If show is false, set width to 0 to hide the column
                //Hide the header and column if show is false
                width = 0;
            } else {
                if ($header.hasClass('grid-col-small')) { //For checkbox or radio, set width as 30
                    width = 50;
                } else {
                    if (_.isUndefined(definedWidth) || definedWidth === '' || _.includes(definedWidth, '%')) {
                        $headerCol = $(headerCols[id]);
                        if ($headerCol.length) {
                            tempWidth = $headerCol[0].style.width;
                            if (tempWidth === '' || tempWidth === '0px' || tempWidth === '90px' || _.includes(tempWidth, '%')) { //If width is not 0px, width is already set. So, set the same width again
                                width = $header.width();
                                /*
                                 * WMS-21545: In case of tabs / accordions / wizard, width of $header is not available for inactive panes
                                 * In such cases, calculating the width of column cells against the closest parent whose width is available
                                */
                                if (width <= 0) {
                                    var currentNode = $header;
                                    var elemWidth = width;
                                    var padding = 0;
                                    while (elemWidth <= 0) {
                                        currentNode = currentNode.parent();
                                        elemWidth = currentNode.width();
                                        // Find padding of all the elements which are on top of table
                                        if (currentNode.find('table').length && currentNode.prop('style')) {
                                            padding = padding + parseFloat(currentNode.css('padding-left')) + parseFloat(currentNode.css('padding-right'));
                                        }
                                    }
                                    if (elemWidth > 0) {
                                        // remove padding from parent elem width to avoid assign extra width to table columns
                                        if (padding) {
                                            elemWidth = elemWidth - padding;
                                        }

                                        // If the width is provided in % for inactive panes, convert % to pixel
                                        if (_.includes(tempWidth, '%')) {
                                            var widthPercent = parseInt(tempWidth);
                                            var pixelWidth = (elemWidth)*(widthPercent/100);
                                            width = pixelWidth;
                                        } else { // Else divide the parent width by the number of columns available
                                            // If any columns have defined width, remove that width from parent elem width
                                            var parentWidth = (definedColWidth && definedColWidth > 0) ? elemWidth - definedColWidth : elemWidth;
                                            // ColsLen has length of columns whose width is undefined
                                            var totalCols = colsLen ? colsLen : headerCols.length;
                                            width = parentWidth / totalCols;
                                            width = width > 90 ? ((colLength === id + 1) ? width - 17 : width) : 90; //columnSanity check to prevent width being too small and Last column, adjust for the scroll width
                                        }
                                    } else {
                                        width = width > 90 ? ((colLength === id + 1) ? width - 17 : width) : 90; // fallback to the older approach
                                    }
                                } else {
                                    width = width > 90 ? ((colLength === id + 1) ? width - 17 : width) : 90; //columnSanity check to prevent width being too small and Last column, adjust for the scroll width
                                }
                            } else {
                                width = tempWidth;
                            }
                        }
                    } else {
                        width = definedWidth;
                    }
                }
            }
            $(headerCols[id]).css('width', width);
            $(bodyCols[id]).css('width', width);
        });
        this.toggleRowFilter(true);
        this.gridElement.parent().prop('scrollLeft', scrollLeft);
        this.gridHeaderElement.parent().prop('scrollLeft', scrollLeft);
    },

    /* Returns the selected columns in the table. */
    getSelectedColumns: function () {
        var selectedColsData = {},
            headerData = [],
            self = this,
            multiSelectColIndex,
            radioColIndex,
            colIndex;
        $.extend(headerData, this.preparedHeaderData);

        if (this.options.multiselect) {
            headerData.some(function (item, i) {
                if (item.field === 'checkbox') {
                    multiSelectColIndex = i;
                    return true;
                }
            });
            headerData.splice(multiSelectColIndex, 1);
        } else if (this.options.showRadioColumn) {
            headerData.some(function (item, i) {
                if (item.field === 'radio') {
                    radioColIndex = i;
                    return true;
                }
            });
            headerData.splice(radioColIndex, 1);
        }
        if (this.options.showRowIndex) {
            headerData.some(function (item, i) {
                if (item.field === 'rowIndex') {
                    colIndex = i;
                    return true;
                }
            });
            headerData.splice(colIndex, 1);
        }

        headerData.forEach(function (colDef) {
            var field = colDef.field;
            if (colDef.selected) {
                selectedColsData[field] = {
                    'colDef': colDef,
                    'colData': self.options.data.map(function (data) {
                        return data[field];
                    })
                };
            }
        });
        return selectedColsData;
    },

    /* Sets the options for the grid. */
    _setOption: function (key, value) {
        this._super(key, value);
        switch (key) {
            case 'showHeader':
                this._toggleHeader();
                this._toggleSearch();
                this.setColGroupWidths();
                this.addOrRemoveScroll();
                break;
            case 'filtermode':
                this._toggleSearch();
                break;
            case 'searchLabel':
                if (this.gridSearch) {
                    this.gridSearch.find('[data-element="dgSearchText"]').attr('placeholder', value);
                    this.gridSearch.find('[data-element="dgSearchButton"]').attr('title', value);
                }
                break;
            case 'selectFirstRow':
                this.selectFirstRow(value);
                break;
            case 'data':
                if(!this.isResetSortIconsDone) {
                    this.setSortIconDefault();
                }
                this.refreshGridData();
                break;
            case 'dataStates':
                if (this.dataStatus.state === 'nodata') {
                    this.setStatus('nodata', this.dataStatus.nodata);
                } else if (this.dataStatus.state === 'loading') {
                    this.setStatus('loading');
                }
                break;
            case 'loadingicon':
                this.dataStatusContainer.find('i').removeClass().addClass(this.options.loadingicon);
                break;
            case 'colDefs':
                if(this.options.isNavTypeScrollOrOndemand() && this.options.isNextPageData) {
                    this.tableContainer.find('colgroup').remove();
                    this._prepareHeaderData();
                    this.setColGroupWidths();
                    this._renderHeader();
                    this._renderSearch();
                    this.attachEventHandlers(this.gridElement);
                    this._reselectColumns();
                    this.addOrRemoveScroll();
                    break;
                }
            case 'multiselecttitle':
            case 'multiselectarialabel':
            case 'radioselecttitle':
            case 'radioselectarialabel':
            case 'multiselect': // Fallthrough
            case 'showRadioColumn':
            case 'isrowselectable' :
            case 'rowActions':
            case 'filterNullRecords':
            case 'showRowIndex':
                this.refreshGrid();
                break;
            case 'cssClassNames':
                var gridClass = this.options.cssClassNames.gridDefault + ' ' + this.options.cssClassNames.grid;
                if (this.options.rowExpansionEnabled) {
                    gridClass =  gridClass + ' ' + this.options.cssClassNames.gridRowExpansionClass;
                }
                // Set grid class on table.
                this.tableContainer.attr('class', gridClass);
                if (this.options.spacing === 'condensed') {
                    this._toggleSpacingClasses('condensed');
                }
                break;
            case 'spacing':
                this._toggleSpacingClasses(value);
                break;
            case 'messages':
                this.gridSearch && this.gridSearch.find('option.placeholder').text(value && value.selectField);
                break;
        }
    },

    getOptions: function () {
        return this.options;
    },

    /* Toggles the table header visibility. */
    _toggleHeader: function () {
        if (this.gridHeaderElement) {
            this.gridHeaderElement.empty();
        }
        if (this.tableContainer) {
            this.tableContainer.find('colgroup').remove();
            this.tableContainer.find('thead').remove();
        }
        this.setDefaultColsData();
        if (this.options.showHeader) {
            this._renderHeader();
        }
    },

    /* Toggles the searchbox visibility. */
    _toggleSearch: function () {
        if (this.gridSearch) {
            this.gridSearch.remove();
        }
        if (this.options.filtermode === this.CONSTANTS.SEARCH) {
            this._renderSearch();
        } else if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN) {
            this._renderRowFilter();
            this.setColGroupWidths();
        }
    },
    /* Marks the first row as selected. */
    selectFirstRow: function (value, visible) {
        var $row,
            id;
        //If visible flag is true, select the first visible row item (Do not select the always new row)
        if (visible && this.gridElement.find('tr').is(':visible')) {
            this.__setStatus();
            $row = this.gridElement.find('tr.app-datagrid-row:visible:not(.always-new-row)').first();
        } else {
            $row = this.gridElement.find('tr.app-datagrid-row:not(.always-new-row)').first();
        }
        id = $row.attr('data-row-id');
        // Select the first row if it exists, i.e. it is not the first row being added.
        if ($row.length && this.preparedData.length) {
            this.preparedData[id]._selected = !value;
            // Triggering row click event using javascript click method because jquery trigger method is not triggering the events which are attached through javascript addEventListener method.
            $row[0].click();
        }
    },

    /* Selects a row. */
    selectRow: function (row, value) {
        var rowIndex = _.isNumber(row) ? row : this.Utils.getObjectIndex(this.options.data, row),
            selector,
            $row;
        if (rowIndex !== -1) {
            selector = 'tr.app-datagrid-row[data-row-id=' + rowIndex + ']';
            $row = this.gridElement.find(selector);
            if ($row.length) {
                this.preparedData[rowIndex]._selected = !value;
            }
            if (value) {
                $row.trigger('click');
            } else {
                this.toggleRowSelection($row, value);
                this.options.callOnRowDeselectEvent(this.preparedData[rowIndex]);
            }
        }
    },
    /**
     * deselect a row
     */
    deselectRow: function (row) {
        this.selectRow(row, false);
    },

    /* Toggles the table row selection. */
    toggleRowSelection: function ($row, selected, e, isSelectAll) {
        if (!$row.length) {
            return;
        }

        var rowId = $row.attr('data-row-id'),
            $checkbox,
            $radio;
        if (!this.preparedData[rowId]) {
            return;
        }
        this.preparedData[rowId]._selected = selected;
        if (selected) {
            $row.addClass('active');
        } else {
            $row.removeClass('active');
        }
        if (this.options.showRadioColumn) {
            $radio = $row.find('td input[rowSelectInput]:radio:not(:disabled)');
            $radio.prop('checked', selected);
            this.preparedData[rowId]._checked = selected;
        }
        if (this.options.multiselect) {
            $checkbox = $row.find('td input[name="gridMultiSelect"]:checkbox:not(:disabled)');
            $checkbox.prop('checked', selected);
            $checkbox.siblings('span.sr-only').text(selected ? 'Row Selected' : 'Row Deselected');
            this.preparedData[rowId]._checked = selected;
            // if we check header checkbox(select/unselect all the records) then updating selectAll checkbox state is not required.
            if (!isSelectAll) {
                this.updateSelectAllCheckboxState();
            }
        } else {
            this._deselectPreviousSelection($row, e);
        }
    },

    /* Checks the header checkbox if all table checkboxes are checked, else unchecks it. */
    updateSelectAllCheckboxState: function () {
        if (!this.options.showHeader || !this.options.multiselect) {
            return;
        }
        //As rows visibility is checked, remove loading icon
        this.__setStatus();
        var $headerCheckbox = this.gridHeaderElement.find('th.app-datagrid-header-cell input:checkbox'),
            $tbody = this.gridElement,
            checkedItemsLength = $tbody.find('tr.app-datagrid-row:visible input[name="gridMultiSelect"]:checkbox:checked').length,
            visibleRowsLength = $tbody.find('tr.app-datagrid-row:visible').length;

        if (!visibleRowsLength) {
            $headerCheckbox.prop('checked', false);
            return;
        }
        if (checkedItemsLength === visibleRowsLength) {
            $headerCheckbox.prop('checked', true);
        } else {
            $headerCheckbox.prop('checked', false);
        }
    },
    // triggered on capture phase of click listener.
    // sets the selected rowdata on click.
    rowClickHandlerOnCapture: function (e, $row, options) {
        // If 'isrowselectable' property is enabled, clicking anywhere on the row will trigger its selection. Otherwise, the row will not be selected on click.
        // Also this flag works if mutliselect or radioselect is enabled.
        // In quick edit mode, clicking any part of the row switches it to edit mode, regardless of the flag setting.
        if (this.options.editmode !== this.CONSTANTS.QUICK_EDIT) {
            if ((this.options.multiselect || this.options.showRadioColumn) && !this.options.isrowselectable) {
                if (Number(this.getColInfo(e))) {
                    e.stopPropagation();
                    return;
                }
            }
        }
        $row = $row || $(e.target).closest('tr.app-datagrid-row');
        var gridRow = this.gridElement.find($row);
        // WMS-21139 trigger selectedItems change when the captured click is on the current table but not on child table
        if (gridRow.length && gridRow.closest('tbody').attr('id') === this.gridElement.attr('id')) {
            var rowId = $row.attr('data-row-id');
            var rowData = this.preparedData[rowId];
            var data = this.options.data[rowId];
            this.options.assignSelectedItems(data, e, {'rowId': rowId, '_selected': rowData?._selected});
        }
    },

    /* Handles row selection. */
    rowSelectionHandler: function (e, $row, options) {
        // If 'isrowselectable' property is enabled, clicking anywhere on the row will trigger its selection. Otherwise, the row will not be selected on click.
        // Also this flag works if mutliselect or radioselect is enabled.
        // In quick edit mode, clicking any part of the row switches it to edit mode, regardless of the flag setting.
        if (this.options.editmode !== this.CONSTANTS.QUICK_EDIT) {
            if ((this.options.multiselect || this.options.showRadioColumn) && !this.options.isrowselectable) {
                if (Number(this.getColInfo(e))) {
                    e.stopPropagation();
                    return;
                }
            }
        }
        options = options || {};
        var rowId,
            rowData,
            data,
            selected,
            self = this,
            action = options.action,
            $target = $(e.target),
            isQuickEdit = this.options.editmode === this.CONSTANTS.QUICK_EDIT;

        function callRowSelectionEvents() {
            if (selected && _.isFunction(self.options.onRowSelect)) {
                self.options.onRowSelect(data, e);
            }
            if (!selected && _.isFunction(self.options.onRowDeselect)) {
                self.options.onRowDeselect(data, e);
            }
        }

        $row = $row || $target.closest('tr.app-datagrid-row');

        // Fix for [WMS-20546]: If column has a value expression, an extra div is getting added inside <td>.
        // so checking if target or its parent element has the class '.app-datagrid-cell'
        if (action || (isQuickEdit && ($target.hasClass('app-datagrid-cell') || $target.closest("td.app-datagrid-cell").length) && !$row.hasClass('always-new-row'))) {
            //In case of advanced edit, Edit the row on click of a row
            options.action = options.action || 'edit';

            if (options.operation === 'new' || self.options.actionsEnabled.edit) {
                self.toggleEditRow(e, options)
            }

            if (options.skipSelect) {
                return;
            }
        }
        rowId = $row.attr('data-row-id');
        rowData = this.preparedData[rowId];
        data = this.options.data[rowId];
        selected = (rowData && rowData._selected) || false;
        if (!options.skipSingleCheck && (($row.hasClass('active') && !this.options.multiselect) || !rowData)) {
            if (!isQuickEdit && options.operation !== 'new') { //For quick edit, row will be in edit mode. So, no need to call events.
                callRowSelectionEvents();
            }
            return;
        }
        this.options.callOnRowClickEvent(data, e);
        selected = !selected;
        this.options.assignSelectedItems(data, e, {'rowId': rowId, '_selected': selected});
        this.toggleRowSelection($row, selected, e);
        callRowSelectionEvents();
    },
    /*Handles the double click of the grid row*/
    rowDblClickHandler: function (e, $row) {
        e.stopPropagation();
        $row = $row || $(e.target).closest('tr.app-datagrid-row');
        var rowData, rowId = $row.attr('data-row-id');
        rowData = this.preparedData[rowId];
        if (!rowData) {
            return;
        }
        if (_.isFunction(this.options.onRowDblClick)) {
            this.options.onRowDblClick(rowData, e);
        }
    },
    closePopover: function() {
        //If the DataTable is in the popover, popover shouldn't be closed
        this.options.closePopover(this.element);
    },
    headerClickHandler: function (e) {
        var $th = $(e.target).closest('th.app-datagrid-header-cell'),
            id = $th.attr('data-col-id');
        //Closing the popovers if any present when clicked on header or while sorting
        this.closePopover();
        this.options.onHeaderClick(this.preparedHeaderData[id], e);
    },
    /* Handles column selection. */
    columnSelectionHandler: function (e, $headerCell) {
        if (e) {
            e.stopImmediatePropagation();
        }
        var $th = e ? $(e.target).closest('th.app-datagrid-header-cell') : $headerCell,
            id = $th.attr('data-col-id'),
            colDef = this.preparedHeaderData[id],
            field = colDef.field,
            selector = 'td[data-col-id="' + id + '"]',
            $column = this.gridElement.find(selector),
            selected = $column.data('selected') || false,
            colInfo = {
                colDef: colDef,
                data: this.options.data.map(function (data) {
                    return data[field];
                }),
                sortDirection: this._getColumnSortDirection(colDef.field)
            },
            selectedClass = this.options.cssClassNames.selectedColumn;
        selected = !selected;
        colDef.selected = selected;
        $column.data('selected', selected);

        if (selected) {
            $column.addClass(selectedClass);
            $th.addClass(selectedClass);
            if (_.isFunction(this.options.onColumnSelect) && e) {
                this.options.onColumnSelect(colInfo, e);
            }
        } else {
            $column.removeClass(selectedClass);
            $th.removeClass(selectedClass);
            if (_.isFunction(this.options.onColumnDeselect) && e) {
                this.options.onColumnDeselect(colInfo, e);
            }
        }
    },
    getTextValue: function (fieldName, alwaysNewRow) {
        return this.options.getFieldValue(alwaysNewRow ? fieldName + '_new' : fieldName);
    },
    getUploadedFiles: function ($el, fieldName) {
        return _.get(document.forms, [$el.find('form').attr('name'), fieldName, 'files', 0]);
    },
    isDataModified: function ($editableElements, rowData, alwaysNewRow) {
        var isDataChanged = false,
            self = this;

        function getEpoch(val) {
            return val ? moment(val).valueOf() : val;
        }

        $editableElements.each(function () {
            var $el = $(this),
                colId = $el.attr('data-col-id'),
                colDef = self.preparedHeaderData[colId],
                text = self.getTextValue(colDef.field, alwaysNewRow),
                originalData = _.get(rowData, colDef.field);
            if (colDef.editWidgetType === 'upload') {
                //For upload widget, check if any file is uploaded
                isDataChanged = self.getUploadedFiles($el, colDef.field) instanceof File;
            } else {
                //If new value and old value are not defined, then data is not changed
                if (!self.Utils.isDefined(text) && (originalData === null || originalData === undefined)) {
                    isDataChanged = false;
                } else {
                    //For datetime, compare the values in epoch format
                    if (colDef.editWidgetType === 'datetime') {
                        isDataChanged = !(getEpoch(originalData) === getEpoch(text));
                    } else {
                        isDataChanged = !(originalData == text);
                    }
                }
            }
            if (isDataChanged) {
                return !isDataChanged;
            }
        });
        return isDataChanged;
    },
    //Focus the active row
    focusActiveRow: function () {
            this.gridElement.find('tr.app-datagrid-row.active').focus();
    },
    focusNewRow: function () {
        var newRow = this.gridElement.find('tr.always-new-row');
        var newRowInputs = newRow && newRow.find("input") || [];
        newRowInputs.length && newRowInputs[0].focus();
    },
    disableActions: function (val) {
        var $deleteBtns = this.gridElement.find('.delete-row-button'),
            $editBtns = this.gridElement.find('.edit-row-button');
        if (val) {
            //Disable edit and delete actions while editing a row
            $editBtns.addClass('disabled-action');
            $deleteBtns.addClass('disabled-action');
        } else {
            $editBtns.removeClass('disabled-action');
            $deleteBtns.removeClass('disabled-action');
        }
    },
    //Function to the first input element in a row
    setFocusOnElement: function (e, $el, skipDelay) {
        var $firstEl,
            $target = e && $(e.target),
            $focusEl;
        //If focused directly on the cell, focus the input in the cell
        if ($target && $target.hasClass('app-datagrid-cell')) {
            $firstEl = $target.find('input');
        } else {
            if (!$el) {
                $el = $target.closest('tr.app-datagrid-row').find('td.cell-editing');
            } else if ($el.hasClass('app-datagrid-row')) {
                $el = $el.find('td.cell-editing');
            }

            $firstEl = $($el).first().find('input');
            if (!$firstEl.length) {
                $firstEl = $($el).first().find('textarea');
            }
            if (!$firstEl.length) {
                $firstEl = $($el).first().find('select');
            }
            if(!($(e.target).find('td').first().hasClass('td.cell-editing'))){
                $firstEl=$el.find('td');
            }
        }
        //Focus and select the first element
        if ($firstEl.length) {
            $focusEl = $firstEl.first();
            if (skipDelay) {
                $focusEl.focus();
                $focusEl.select();
            } else {
                this.options.timeoutCall(function () {
                    $focusEl.focus();
                    $focusEl.select();
                });
            }
        }
    },
    removeNewRow: function ($row) {
        this.disableActions(false);
        this._setGridEditMode(false);

        //Don't remove the always new row
        if ($row.hasClass('always-new-row')) {
            return;
        }

        $row.attr('data-removed', true);
        $row.remove();
        if (!this.preparedData.length) {
            this.setStatus('nodata', this.dataStatus.nodata);
        }
        this.addOrRemoveScroll();
        this.toggleNewRowActions(false);
    },
    //Method to save a row which is in editable state
    saveRow: function (callBack) {
        this.gridElement.find('tr.app-datagrid-row.row-editing:not(.always-new-row)').each(function () {
            $(this).trigger('click', [undefined, {action: 'save', skipSelect: true, noMsg: true, success: callBack}]);
        });
    },
    //Method to make row editable with widgets
    makeRowEditable: function ($row, rowData, alwaysNewRow) {
        var self = this,
            $originalElements = $row.find('td.app-datagrid-cell'),
            rowId = parseInt($row.attr('data-row-id'), 10),
            $editableElements,
            _rowData = _.clone(rowData);

        _rowData.$index = rowId + 1;
        // Function to remove validators and set form state to untouched for inline form control
        this.options.removeValidations(alwaysNewRow);
        this.options.generateInlineEditRow(_rowData, alwaysNewRow);

        $originalElements.each(function () {
            var $el = $(this),
                cellText = $el.text(),
                id = $el.attr('data-col-id'),
                colDef = self.preparedHeaderData[id],
                value,
                editableTemplate;

            if (!colDef.readonly) {
                value = _.get(rowData, colDef.field);
                editableTemplate = self.options.getInlineEditWidget(colDef.field, value, alwaysNewRow);
                // Fix for [WMS-27289]: In Edit mode (inline and quick edit),
                // pressing the Tab key initially focuses on the `<td>` element, and pressing Tab again moves the focus to the input widget.
                // To address this, the `tabindex` and `title` attributes are removed from the `<td>` element during Edit mode
                // and are re-applied when switching back to View mode.
                $el.removeAttr('title');
                $el.removeAttr('tabindex');
                if (!(colDef.customExpression || (colDef.formatpattern && colDef.formatpattern !== 'None'))) {
                    $el.addClass('cell-editing').html(editableTemplate).data('originalText', cellText);
                } else {
                    $el.addClass('cell-editing editable-expression').data('originalValue', {
                        'rowIndex': rowId,
                        'fieldName': colDef.field
                    });
                    $el.addClass('cell-editing editable-expression').html(editableTemplate).data('originalText', cellText);
                }
                $el.addClass('form-group');
                // Function to apply validators to Inline form controls
                if (colDef.binding !== 'rowOperations') {
                    self.options.timeoutCall(function () {
                        self.options.applyValidations(colDef, alwaysNewRow);
                        if (colDef.required) {
                            $el.addClass('required-field');
                        }
                    });
                } else if (colDef.required) {
                    $el.addClass('required-field');
                }
            }
        });

        $editableElements = $row.find('td.cell-editing');
        $editableElements.on('click', function (e) {
            e.stopPropagation();
        });
        $editableElements.on('keydown', function (e) {
            //To prevent up and down arrows, navigating to other rows in edit mode
            if ((e.which === 38 || e.which === 40) && (e.currentTarget && !e.currentTarget.closest('.always-new-row'))) {
                e.stopPropagation();
            }
        });
    },
    // WMS-18568 changes added Save and Cancel buttons for Inline Data Table with no actions
    toggleNewRowActions: function (saveInd) {
        var self = this,
            $gridActions = $(this.element).siblings('div.panel-footer, div.panel-heading').find('div.app-datagrid-actions'),
            $newRow = this.gridElement.find('tr.app-datagrid-row.row-editing'),
            $newRowButton = $gridActions.find('i.wi-plus').closest('.app-button');
        if (this.options.editmode === this.CONSTANTS.INLINE && (this.options.rowActions.length === 0 || !_.some(this.options.rowActions, { action: 'editRow($event)' }))) {
            if (saveInd) {
                $gridActions.append('<button type="button" wmbutton="" class="btn app-button btn-default cancelNewRow" tabindex="0" accesskey="" title="Cancel">'+
                    '<i aria-hidden="true" class="app-icon wi wi-cancel"></i>'+
                    '<span class="sr-only">Cancel Icon</span><span class="btn-caption">Cancel</span>'+
                    '</button>'+
                    '<button type="button" wmbutton="" class="btn app-button btn-primary saveNewRow" tabindex="0" accesskey="" title="Save">'+
                    '<i aria-hidden="true" class="app-icon wi wi-done"></i>'+
                    '<span class="sr-only">Save Icon</span><span class="btn-caption">Save</span>'+
                    '</button>');
                $gridActions.find('.cancelNewRow').on('click', function (event) {
                    self.toggleEditRow(event, {action: 'cancel', $row: $newRow});
                });
                $gridActions.find('.saveNewRow').on('click', function (event) {
                    self.toggleEditRow(event, {action: 'save', $row: $newRow});
                });
                $newRowButton.hide();
            } else {
                $('typeahead-container').removeClass('open');
                $gridActions.find('.cancelNewRow').remove();
                $gridActions.find('.saveNewRow').remove();
                $newRowButton.show();
            }
        }
    },
    _isNewRow: function ($row) {
        var rowId = parseInt($row.attr('data-row-id'), 10);
        return rowId >= this.preparedData.length || $row.hasClass('always-new-row');
    },
    /* Toggles the edit state of a row. */
    toggleEditRow: function (e, options) {
        options = options || {};
        if (e) {
            e.stopPropagation();
        }
        //Closing the popovers if clicked on any row for Quick edit
        this.closePopover();
        var $row = options.$row || $(e.target).closest('tr.app-datagrid-row'),
            $editButton = $row.find('.edit-row-button'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            $deleteButton = $row.find('.delete-row-button'),
            rowData = _.cloneDeep(this.options.data[$row.attr('data-row-id')]) || {},
            self = this,
            action,
            isNewRow,
            $editableElements,
            isDataChanged = false,
            isValid,
            $requiredEls,
            alwaysNewRow = $row.hasClass('always-new-row'),
            advancedEdit = self.options.editmode === self.CONSTANTS.QUICK_EDIT,
            editOptions = {};

        // when a row is edited set actionrow variables
        this.options.setActionRowIndex($row.attr('data-row-id'));
        this.options.setLastActionPerformed(this.options.ACTIONS.EDIT);

        //On success of update or delete
        function onSaveSuccess(skipFocus, error) {
            if (_.isFunction(options.success)) {
                options.success(skipFocus, error);
            }
            if (!advancedEdit || self.options.actionsEnabled.edit) {
                self.focusActiveRow();
            }
        }

        if ($row.attr('data-removed') === 'true') {
            //Even after removing row, focus out is triggered and edit is called. In this case, return here
            return;
        }
        //Select the current edited row
        if (options.selectRow) {
            this.selectRow(rowData, true);
        }
        e = e || {};
        e.data = e.data || {};
        action = e.data.action || options.action;
        if (action === 'edit') {
            if (this.options.editmode === this.CONSTANTS.INLINE) {
                this.options.callLoadInlineWidgetData();
            }
            if (advancedEdit && self.gridElement.find('tr.app-datagrid-row.row-editing:not(.always-new-row)').length) {
                //In case of advanced edit, save the previous row
                self.saveRow(function (skipFocus, error) {
                    self.editSuccessHandler(skipFocus, error, e, $row, true);
                });
                return;
            }
            $row.addClass('row-editing');
            if (_.isFunction(this.options.beforeRowUpdate)) {
                this.options.beforeRowUpdate(rowData, e);
            }

            if (self.options.editmode === self.CONSTANTS.FORM || self.options.editmode === self.CONSTANTS.DIALOG) {
                return;
            }
            //For new operation, set the rowdata from the default values
            if (options.operation === 'new') {
                self.setDefaultRowData(rowData);
                self.toggleNewRowActions(true);
            }
            //Event for on before form render. User can update row data here.
            if (_.isFunction(this.options.onBeforeFormRender)) {
                isValid = this.options.onBeforeFormRender(rowData, e, options.operation || action);
                if (isValid === false) {
                    return;
                }
            }
            this._setGridEditMode(true);
            this.disableActions(true);
            $deleteButton.removeClass('disabled-action');
            this.options.runInNgZone(function () {
                self.makeRowEditable($row, rowData);
            });
            // Show editable row.
            $editButton.addClass('hidden');
            $cancelButton.removeClass('hidden');
            $saveButton.removeClass('hidden');
            $editableElements = $row.find('td.cell-editing');
            if (!options.skipFocus && $editableElements) {
                this.options.timeoutCall(function () {
                    self.setFocusOnElement(e, $editableElements);
                });
            }
            //Event for on before form render. User can access form widgets here.
            if (_.isFunction(this.options.onFormRender)) {
                this.options.onFormRender($row, e, options.operation || action, $row.hasClass('always-new-row'));
            }
        } else {
            $editableElements = $row.find('td.cell-editing');
            isNewRow = self._isNewRow($row);
            if (action === 'save') {

                if (isNewRow) {
                    isDataChanged = true;
                } else {
                    isDataChanged = this.isDataModified($editableElements, rowData, alwaysNewRow);
                }

                if (isDataChanged) {
                    $editableElements.each(function () {
                        var $el = $(this),
                            colId = $el.attr('data-col-id'),
                            colDef = self.preparedHeaderData[colId],
                            fields = _.split(colDef.field, '.'),
                            text;
                        text = self.getTextValue(colDef.field, alwaysNewRow);
                        if (fields.length === 1 && colDef.editWidgetType === 'upload') {
                            _.set(rowData, colDef.field, self.getUploadedFiles($el, colDef.field));
                        } else {
                            text = ((fields.length === 1 || isNewRow) && text === '') ? undefined : text; //Set empty values as undefined
                            if (self.Utils.isDefined(text)) {
                                text = text === 'null' ? null : text; //For select, null is returned as string null. Set this back to ull
                                if (text === null) {
                                    if (fields.length > 1) {
                                        _.set(rowData, fields[0], text); //For related fields, set the object to null
                                    } else {
                                        if (!isNewRow) {
                                            _.set(rowData, colDef.field, ''); //Set to empty for normal fields
                                        }
                                    }
                                } else {
                                    _.set(rowData, colDef.field, text);
                                }
                            } else {
                                //Set undefined while editing the rows
                                if (fields.length === 1 && !isNewRow) {
                                    _.set(rowData, colDef.field, text);
                                }
                            }
                        }
                    });

                    // Check for form control async state and recall save function
                    if ($editableElements.find('.ng-pending').length > 0) {
                        setTimeout(this.toggleEditRow.bind(this, e, options), 200);
                        return;
                    }

                    $requiredEls = $editableElements.find('.ng-invalid');
                    //If required fields are present and value is not filled, return here
                    if ($requiredEls.length > 0) {
                        $requiredEls.each(function (index) {
                            var $invalidTd = $(this).closest('td.app-datagrid-cell');
                            if (index === 0) {
                                $invalidTd.find('[focus-target]').focus();
                            }
                            self.options.setTouched($invalidTd.find('[formcontrolname]').attr('formcontrolname'));
                        });
                        if (_.isFunction(options.success)) {
                            options.success(false, true);
                        }
                        return;
                    }

                    if (isNewRow && advancedEdit && _.isEmpty(rowData)) {
                        self.removeNewRow($row);
                        if (_.isFunction(options.success)) {
                            options.success(false, undefined, true);
                        }
                        return;
                    }

                    if (isNewRow) {
                        if (_.isFunction(this.options.onBeforeRowInsert)) {
                            isValid = this.options.onBeforeRowInsert(rowData, e, editOptions);
                            if (isValid === false) {
                                return;
                            }
                        }
                        this.options.onRowInsert(rowData, e, onSaveSuccess, editOptions);
                        self.toggleNewRowActions(false);
                        /**
                         * In case of on demand and scroll paginations in inline edit mode
                         * Once the new row is added remove it from the view
                         * As the newly added data will be shown as the last record of the whole dataset
                         */
                        if (!$row.hasClass('always-new-row') && (self.options.isNavTypeScrollOrOndemand())) {
                            self.removeNewRow($row);
                        }
                    } else {
                        if (_.isFunction(this.options.onBeforeRowUpdate)) {
                            isValid = this.options.onBeforeRowUpdate(rowData, e, editOptions);
                            if (isValid === false) {
                                return;
                            }
                        }
                        this.options.afterRowUpdate(rowData, e, onSaveSuccess, editOptions);
                    }
                } else {
                    this.cancelEdit($row);
                    if (!options.noMsg) {
                        this.options.noChangesDetected();
                    }
                    if (_.isFunction(options.success)) {
                        options.success(false);
                    }
                }
            } else {
                if (isNewRow) {
                    // close the typeahead dropdown when cancel btn is clicked
                    $("typeahead-container").removeClass("open");
                    self.removeNewRow($row);
                    return;
                }
                // Cancel edit.
                this.cancelEdit($row);
            }
        }
        this.addOrRemoveScroll();
    },
    cancelEdit: function ($row) {
        var self = this,
            $editableElements = $row.find('td.cell-editing'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            $editButton = $row.find('.edit-row-button');

        // when edit action is cancelled on the row clear actionrow variables
        this.options.clearActionRowIndex();

        this.disableActions(false);
        $row.removeClass('row-editing');
        $editableElements.off('click');
        $editableElements.each(function () {
            var $el = $(this),
                value = $el.data('originalValue');
            // Fix for [WMS-27289]: Reassigning `tabindex` and `title` attributes to the `<td>` element when the cancel button is clicked in Edit mode.
            $el.attr('tabindex', 0);
            $el.removeClass('datetime-wrapper cell-editing required-field form-group');
            if (!value) {
                $el.text($el.data('originalText') || '');
                $el.attr('title', $el.text());
            } else {
                $el.html(self.options.getCustomExpression(value.fieldName, value.rowIndex));
            }
        });
        $('typeahead-container').removeClass('open');
        $editButton.removeClass('hidden');
        $cancelButton.addClass('hidden');
        $saveButton.addClass('hidden');
        this._setGridEditMode(false);
    },
    //Function to close the current editing row
    closeEditedRow: function () {
        var $row = this.gridElement.find('tr.app-datagrid-row.row-editing');
        if ($row.length) {
            //If new row, remove the row. Else, cancel the row edit
            if (this._isNewRow($row)) {
                this.removeNewRow($row);
            } else {
                this.cancelEdit($row);
            }
        }
    },
    hideRowEditMode: function ($row) {
        /**
         * In case of on demand and scroll paginations in quick edit mode
         * Once the new row is added, reset the row values
         * Row will always be shown to have a provision of inserting new reccords
         */
        if ($row.hasClass('always-new-row') && (this.options.isNavTypeScrollOrOndemand())) {
            this.resetNewRow($row);
            return;
        }
        var $editableElements = $row.find('td.cell-editing'),
            $editButton = $row.find('.edit-row-button'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            self = this;
        $row.removeClass('row-editing');
        $editableElements.off('click');
        this.disableActions(false);
        this._setGridEditMode(false);
        $editableElements.each(function () {
            var $el = $(this),
                value = $el.data('originalValue'),
                text,
                colDef;
            //Fix for [WMS-27289]: Reassigning `tabindex` and `title` attributes to the `<td>` element when the save button is clicked in Edit mode.
            $el.attr('tabindex', 0);
            $el.removeClass('datetime-wrapper cell-editing required-field form-group');
            if (!value) {
                colDef = self.preparedHeaderData[$el.attr('data-col-id')];
                text = self.getTextValue(colDef.field);
                $el.text(self.Utils.isDefined(text) ? text : '');
                $el.attr('title', $el.text());
            } else {
                $el.html(self.options.getCustomExpression(value.fieldName, value.rowIndex));
            }
        });
        $editButton.removeClass('hidden');
        $cancelButton.addClass('hidden');
        $saveButton.addClass('hidden');
        this.addOrRemoveScroll();
    },
    /* Deletes a row. */
    deleteRow: function (e) {
        e.stopPropagation();
        var $row = $(e.target).closest('tr.app-datagrid-row'),
            rowId = $row.attr('data-row-id'),
            rowData = this.options.data[rowId],
            isNewRow = this._isNewRow($row),
            className,
            isActiveRow,
            isValid,
            options = {},
            self = this;
        // when delete is clicked on the row set actionrow variables
        this.options.setActionRowIndex(rowId);
        this.options.setLastActionPerformed(this.options.ACTIONS.DELETE);

        if (_.isFunction(this.options.beforeRowDelete)) {
            this.options.beforeRowDelete(rowData, e);
        }
        if (isNewRow) {
            this.disableActions(false);
            this._setGridEditMode(false);
            $row.attr('data-removed', true);
            $row.remove();
            if (!this.preparedData.length) {
                //On delete of a new row with no data, show no data message
                this.setStatus('nodata', this.dataStatus.nodata);
            }
            this.addOrRemoveScroll();
            return;
        }
        /* calling onbeforerowDelete callback function.*/
        if(_.isFunction(this.options.onBeforeRowDelete)) {
            isValid = this.options.onBeforeRowDelete(rowData, e, options);
            if (isValid === false) {
                return;
            }
        }
        if (_.isFunction(this.options.onRowDelete)) {
            className = this.options.cssClassNames.deleteRow;
            isActiveRow = $row.attr('class').indexOf('active') !== -1;
            if (isActiveRow) {
                $row.removeClass('active');
            }
            $row.addClass(className);
            this.options.onRowDelete(rowData, function () {
                if (isActiveRow) {
                    $row.addClass('active');
                }
                $row.removeClass(className);
                self.addOrRemoveScroll();
            }, e, function (skipFocus, error) {
                if (self.options.isNavTypeScrollOrOndemand()) {
                    var rowId = +$(e.target).closest("tr.app-datagrid-row").attr("data-row-id");
                    // remove existing row from tbody
                    var $row = self.gridElement.find('tr.app-datagrid-row[data-row-id="' + rowId + '"]');
                    self.options.setDeletedRowIndex(rowId);
                    // remove data
                    self.preparedData.splice(rowId,1);
                    // storing the data of deleted row in "options.deletedRowData"
                    self.options.data.splice(rowId,1);
                    // decrementing index values and data-row-id for remaining rows
                    self.gridElement.find('tr.app-datagrid-row:gt(' + rowId + ')').each(function(index, row) {
                        if (!$row.is(':last-child') && (!$(row).hasClass('always-new-row'))) {
                            $(row).attr("data-row-id", rowId);
                            self.preparedData[rowId].$$pk--;
                            self.preparedData[rowId].$$index--;
                            self.preparedData[rowId].$index--;
                            rowId++;
                        }
                    });
                    $row.remove();
                }


                //For quick edit, on clicking of delete button or DELETE key, edit the next row
                if (self.options.editmode !== self.CONSTANTS.QUICK_EDIT || !($(e.target).hasClass('delete-row-button') || self.Utils.isDeleteKey(e))) {
                    return;
                }
                //Call set status, so that the rows are visible for fom operations
                self.__setStatus();
                var rowID,
                    $nextRow;
                if (error) {
                    return;
                }
                //On success, Focus the next row. If row is not present, focus the previous row
                rowID = +$(e.target).closest('tr.app-datagrid-row').attr('data-row-id');
                $nextRow = self.gridElement.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');
                if (!$nextRow.length) {
                    $nextRow = self.gridElement.find('tr.app-datagrid-row[data-row-id="' + (rowID - 1) + '"]');
                }
                $nextRow.trigger('click', [undefined, {action: 'edit', skipFocus: skipFocus}]);
            }, options);
        }
    },

    /* Deletes a row and updates the header checkbox if multiselect is true. */
    deleteRowAndUpdateSelectAll: function (e) {
        this.deleteRow(e);
        this.updateSelectAllCheckboxState();
    },

    /* Keeps a track of the currently selected row, and deselects the previous row, if multiselect is false. */
    _deselectPreviousSelection: function ($row, e) {
        var selectedRows = this.gridElement.find('tr.app-datagrid-row.active'),
            rowId = $row.attr('data-row-id'),
            self = this;
        selectedRows.each(function () {
            var id = $(this).attr('data-row-id'),
                preparedData = self.preparedData[id];
            if (id !== rowId && preparedData) {
                $(this).find('input[rowSelectInput]:radio').prop('checked', false);
                preparedData._selected = preparedData._checked = false;
                $(this).removeClass('active');
                self.options.callOnRowDeselectEvent(preparedData, e);
            }
        });
    },
    //Method to remove sort icons from the column header cells
    resetSortIcons: function ($el) {
        this.isResetSortIconsDone = true;
        var $sortContainer;
        //If sort icon is not passed, find out the sort icon from the active class
        if (!$el && this.gridHeaderElement) {
            $sortContainer = this.gridHeaderElement.find('.sort-buttons-container.active');
            $el = $sortContainer.find('i.sort-icon');
            $sortContainer.removeClass('active');
        }
        $el.removeClass('desc asc').removeClass(this.options.cssClassNames.descIcon).removeClass(this.options.cssClassNames.ascIcon);
    },
    setSortIconDefault: function() {
        const sortInfo = this.options.sortInfo,
            $e = this.tableContainer,
            $th = $e.find("[data-col-field='" + sortInfo.field + "']"),
            $sortContainer = $th.find('.sort-buttons-container'),
            $sortIcon = $sortContainer.find('i.sort-icon'),
            direction = sortInfo.direction;
        if (direction === 'asc') {
            $sortIcon.addClass(direction + ' ' + this.options.cssClassNames.ascIcon);
            $sortContainer.addClass('active');
        } else if (direction === 'desc'){
            $sortIcon.addClass(direction + ' ' + this.options.cssClassNames.descIcon);
            $sortContainer.addClass('active');
        }

    },
    /* Handles table sorting. */
    sortHandler: function (e) {
          e.stopImmediatePropagation();
        // If header span is clicked and column selection is enabled, call header click
        if ($(e.target).hasClass('header-data') && this.options.enableColumnSelection) {
            this.headerClickHandler(e);
        }
        var $e = $(e.target),
            $th = $e.closest('th.app-datagrid-header-cell'),
            id = $th.attr('data-col-id'),
            $sortContainer = $th.find('.sort-buttons-container'),
            $sortIcon = $sortContainer.find('i.sort-icon'),
            direction = $sortIcon.hasClass('asc') ? 'desc' : 'asc',
            sortInfo = this.options.sortInfo,
            $previousSortMarker = this.gridHeaderElement.find('.sort-buttons-container.active'),
            field = $th.attr('data-col-field'),
            $previousSortedColumn,
            $previousSortIcon,
            colId,
            colDef;
        this.resetSortIcons($sortIcon);
        $sortIcon.addClass(direction);
        //Add the classes based on the direction
        if (direction === 'asc') {
            $sortIcon.addClass(this.options.cssClassNames.ascIcon);
            $sortContainer.addClass('active');
        } else if (direction === 'desc') {
            $sortIcon.addClass(this.options.cssClassNames.descIcon);
            $sortContainer.addClass('active');
        }
        if ($previousSortMarker.length) {
            //Reset the previous sorted column icons and info
            $previousSortedColumn = $previousSortMarker.closest('th.app-datagrid-header-cell');
            colId = $previousSortedColumn.attr('data-col-id');
            colDef = this.preparedHeaderData[colId];
            $previousSortIcon = $previousSortMarker.find('i.sort-icon');
            if (colDef.field !== field) {
                $previousSortMarker.removeClass('active');
                this.resetSortIcons($previousSortIcon);
            }
            colDef.sortInfo = {'sorted': false, 'direction': ''};
        }
        sortInfo.direction = direction;
        sortInfo.field = this.preparedHeaderData && this.preparedHeaderData[e.currentTarget.getAttribute('data-col-id')].sortby || field;
        sortInfo.sortBy = this.preparedHeaderData && this.preparedHeaderData[e.currentTarget.getAttribute('data-col-id')].sortby ? field : '';
        if (direction !== '') {
            this.preparedHeaderData[id].sortInfo = {'sorted': true, 'direction': direction};
        }
        this._setGridEditMode(false);
        this.closeEditedRow();
        this.options.sortHandler.call(this, this.options.sortInfo, e, 'sort');
    },
    //Method to handle up and next key presses
    processUpDownKeys: function (event, $row, direction) {
        var self = this;
        var rowData = $row.find('input').val();
        if ($row.hasClass('row-editing') && self.options.editmode === self.CONSTANTS.QUICK_EDIT && rowData) {
            self.toggleEditRow(event, {
                'action': 'save',
                'noMsg': true,
                'success': function (skipFocus, error) {
                    self.editSuccessHandler(skipFocus, error, event, $row, true, direction);
                }
            });
        } else {
            $row = direction === 'down' ? $row.next() : $row.prev();
            if (this.options.rowExpansionEnabled && !$row.is(':visible')) {
                $row = direction === 'down' ? $row.next() : $row.prev();
            }
            $row.focus();
        }
    },
    //Reset new row data
    resetNewRow: function ($row) {
        var rowData = {},
            self = this;

        this.options.clearForm(true);

        self.setDefaultRowData(rowData);

        //Set the default values for widgets in the row
        $row.find('[data-field-name]').each(function () {
            var $input = $(this),
                fieldName = $input.attr('data-field-name') + '_new';
            self.options.setFieldValue(fieldName, rowData[$input.attr('data-field-name')] || '')
        });
        self.options.safeApply();
        self.setFocusOnElement(undefined, $row, true);
    },
    _onEnter: function ($target, $row, quickEdit, event) {
        var self = this;
        if($target.is('button')){
            return;
        }
        if (quickEdit && $target.hasClass('app-datagrid-row') && !$target.hasClass('row-editing')) {
            $row.trigger('click', [undefined, {action: 'edit'}]);
        } else {
            //On click of enter while inside a widget in editing row, save the row
            if ($row.hasClass('row-editing') && $target.closest('[data-field-name]').length) {
                const $editingRow = $row;
                $target.blur(); //Blur the input, to update the model
                self.toggleEditRow(event, {
                    'action': 'save',
                    'success': function (skipFocus, error) {
                        //On error, focus the same field. Else, focus the row
                        if (error) {
                            $target.focus();
                        } else {
                            if(!quickEdit){
                                self.focusActiveRow();
                            }
                            self.options.timeoutCall(function () {
                                if(quickEdit){
                                    var rowId = $editingRow[0]?.getAttribute('data-row-id');
                                    var matchingRow = self.gridElement[0].querySelector("tr[data-row-id='" + rowId + "']");
                                    if($(matchingRow).hasClass('always-new-row')){return;}
                                    if (matchingRow) {
                                        if (!self.options.multiselect) {
                                            $(self.gridElement).find('tr.app-datagrid-row.active').removeClass('active');
                                        }
                                        matchingRow.classList.remove('active');
                                        self.hideRowEditMode($(matchingRow));
                                    }
                                }
                                self.focusNewRow();
                            }, 400);
                        }
                    }
                });
            } else {
                $row.trigger('click');
                // When enter event is recived on the new row focus the row to enter text
                if (quickEdit && $target.hasClass('always-new-row') && $target.hasClass('row-editing')) {
                    self.focusNewRow();
                }
            }
        }
        //Stop the enter keypress from submitting any parent form. If target is button, event should not be stopped as this stops click event on button
        if (!$target.is('button')) {
            event.stopPropagation();
        }
    },
    // Handles keydown event on row items.
    onKeyDown: function (event) {
        var $target = $(event.target),
            $row = $target.closest('tr.app-datagrid-row'),
            self = this,
            quickEdit = this.options.editmode === this.CONSTANTS.QUICK_EDIT,
            isNewRow;
        if (this.options.rowExpansionEnabled && !$row.length) {
            $row = $target.closest('tr.app-datagrid-detail-row')
        }

        if (this.Utils.isDeleteKey(event)) { //Delete Key
            //For input elements, dont delete the row. If delete button is not present, dont allowe deleting by keyboard shortcut
            if (!this.options.actionsEnabled.delete || $target.is('input') || $target.hasClass('form-control')) {
                return;
            }
            this.deleteRow(event);
            return;
        }
        if (event.which === 27) { //Escape key
            isNewRow = this._isNewRow($row);
            //On Escape, cancel the row edit
            if (isNewRow && $row.hasClass('always-new-row')) {
                $target.blur();
                self.resetNewRow($row);
            } else {
                $row.trigger('click', [undefined, {action: 'cancel'}]);
            }

            if (!isNewRow && self.options.editmode!==this.CONSTANTS.QUICK_EDIT) {
                $row.focus();
            }
            return;
        }
        if (event.which === 13) { //Enter key
            event.stopPropagation();
            // Fix for [WMS-28247]: prevent row getting selected when pressing Enter on a data table field in view mode when  isrowselectable flag is false.
            if (this.options.editmode !== this.CONSTANTS.QUICK_EDIT && !$row.hasClass('row-editing')) {
                if ((this.options.multiselect || this.options.showRadioColumn) && !this.options.isrowselectable && Number(this.getColInfo(event))) {
                   return;
                }
            }
            this._debounceOnEnter($target, $row, quickEdit, event);
            return;
        }
        if (event.which === 38) { // up-arrow action
            this.processUpDownKeys(event, $row, 'up');
            return;
        }
        if (event.which === 40) { // down-arrow action
            this.processUpDownKeys(event, $row, 'down');
        }
    },
    editSuccessHandler: function (skipFocus, error, e, $row, isSameRow, direction) {
        var self = this,
            rowID,
            $nextRow;
        //Call set status, so that the rows are visible for fom operations
        self.__setStatus();
        //On error, focus the current row first element
        if (error) {
            self.setFocusOnElement(e);
            return;
        }
        //On success, make next row editable. If next row is not present, add new row
        rowID = +$row.attr('data-row-id');
        if (direction) {
            rowID = direction === 'down' ? ++rowID : --rowID;
            $nextRow = self.gridElement.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');
            if ($nextRow.length) {
                $nextRow.focus();
            } else {
                $row.focus();
            }
            return;
        }
        // Fix for [WMS-20545]: The deselect/select event is being triggered twice when isSameRow is undefined
        if (!isSameRow && !_.isUndefined(isSameRow)) {
            rowID++;
        }
        $nextRow = self.gridElement.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');

        //For always new row, dont trigger the edit action
        if ($nextRow.hasClass('always-new-row')) {
            if (self.options.formPosition !== 'top' || $row.hasClass('always-new-row')) {
                self.addNewRow(skipFocus);
            }
        } else if ($nextRow.length) {
            $nextRow.trigger('click', [undefined, {
                action: 'edit',
                skipFocus: skipFocus,
                skipSelect: self.options.multiselect
            }]);
        } else if (self.options.actionsEnabled.new) {
            self.addNewRow(skipFocus);
        }
    },
    //Method to check if the docus is on last column
    isLastColumn: function ($target) {
        var $cell = $target.closest('td.app-datagrid-cell'),
            $editCells;

        if ($cell.is(':last-child')) {
            return true;
        }

        if ($cell.hasClass('cell-editing')) {
            //Find and compare the last editable column which is not disabled
            $editCells = $cell.closest('tr.app-datagrid-row').find('.cell-editing').has('> :not([disabled="disabled"])');
            return $cell.attr('data-col-id') === $editCells.last().attr('data-col-id');
        }
        return false;
    },
    getColInfo: function(event) {
        var column = $(event.target).closest('td.app-datagrid-cell');
        var colId = column.attr('data-col-id');
        return colId;
    },
    keydownHandler: function(event) {
        if (event && event.key === 'Enter') {
            this.sortHandler(event);
        }
    },
    /* Attaches all event handlers for the table. */
    attachEventHandlers: function ($htm) {
        var $header = this.gridHeaderElement,
            self = this;

        if (this.options.enableRowSelection) {
            $htm[0].removeEventListener('click', this.rowClickHandlerOnCapture.bind(this));
            $htm.off();
            $htm[0].addEventListener('click', this.rowClickHandlerOnCapture.bind(this));
            // add js click handler for capture phase in order to first listen on grid and
            // assign selectedItems so that any child actions can have access to the selectedItems.
            $htm.on('click', this.rowSelectionHandler.bind(this));
            $htm.on('dblclick', this.rowDblClickHandler.bind(this));
            $htm.on('keydown', this.onKeyDown.bind(this));
        }

        if ($header) {
            if (this.options.enableColumnSelection) {
                $header.find('th[data-col-selectable]').off('click', this.columnSelectionHandler.bind(this));
                $header.find('th[data-col-selectable]').on('click', this.columnSelectionHandler.bind(this));
            } else {
                $header.find('th[data-col-selectable]').off('click');
            }

            if (this.options.enableSort) {
                if (this.options.enableColumnSelection) {
                    $header.find('th[data-col-sortable] .header-data').off('click', this.sortHandler.bind(this));
                    $header.find('th[data-col-sortable] .header-data').on('click', this.sortHandler.bind(this));
                    $header.find('th[data-col-sortable]').off('keydown', this.keydownHandler.bind(this));
                    $header.find('th[data-col-sortable]').on('keydown', this.keydownHandler.bind(this));
                } else {
                    $header.find('th[data-col-sortable]').off('click', this.sortHandler.bind(this));
                    $header.find('th[data-col-sortable]').on('click', this.sortHandler.bind(this));
                    $header.find('th[data-col-sortable]').off('keydown', this.keydownHandler.bind(this));
                    $header.find('th[data-col-sortable]').on('keydown', this.keydownHandler.bind(this));
                }
            } else {
                if (this.options.enableColumnSelection) {
                    $header.find('th[data-col-sortable] .header-data').off('click');
                } else {
                    $header.find('th[data-col-sortable]').off('click');
                }
            }
        }
        if (this.options.rowActions.length) {
            $htm.find('.cancel-edit-row-button').off('click');
            $htm.find('.save-edit-row-button').off('click');
            $htm.find('.cancel-edit-row-button').on('click', {action: 'cancel'}, this.toggleEditRow.bind(this));
            $htm.find('.save-edit-row-button').on('click', {action: 'save'}, this.toggleEditRow.bind(this));
        }
        if (self.options.editmode === self.CONSTANTS.QUICK_EDIT) {
            $htm.on('focus', 'tr.app-datagrid-row', function (e) {
                var $row = $(e.currentTarget);
                if (!$row.hasClass('row-editing')) {
                    self.toggleEditRow(e, { $row: $row, action: 'edit'});
                }
            });
            //On tab out of a row, save the current row and make next row editable
            $htm.on('focusout', 'tr.app-datagrid-row','thead.table-header', function (e) {
                var $target = $(e.target),
                    $row = $target.closest('tr.app-datagrid-row'),
                    $relatedTarget = $(e.relatedTarget),
                    isLastColumn = self.isLastColumn($target, $relatedTarget),
                    isTargetRowAction = $target.closest('span.actions-column').length>0,
                    isRelatedTargetRowAction = $relatedTarget.closest('span.actions-column').length>0,
                    isTargetGridAction = $relatedTarget.closest('div.app-datagrid-actions').length>0,
                    isRelatedTargetGridAction = $relatedTarget.closest('div.app-datagrid-actions').length>0,
                    invalidTargets = '.row-editing:not(".always-new-row"), .row-action-button, .app-datagrid-cell, .caption, button.btn-time, button.btn-date';

                //Check if the focus out element is outside the grid or some special elements
                function isInvalidTarget() {
                    if (!$relatedTarget.closest('.app-grid').length) {
                        return true;
                    }
                    return $relatedTarget.is(invalidTargets);
                }

                //If focus is on the same row, return here
                if ($relatedTarget.is('tr.app-datagrid-row')) {
                    if ($relatedTarget.attr('data-row-id') === $row.attr('data-row-id')) {
                        return;
                    }
                }
                // If class has danger, confirm dialog is opened, so dont save the row.
                //If focusout is because of input element or row action or current row, dont save the row
                if (isRelatedTargetRowAction || $row.hasClass("danger") || isRelatedTargetGridAction || (isTargetRowAction && isRelatedTargetRowAction) || (isTargetRowAction && e.relatedTarget ===null) || isInvalidTarget() || $relatedTarget.attr("focus-target") === "") {
                    return;
                }
                // Save the Row if any button from Grid action is clicked / AddRow action is
                // triggered from the Row Actions
                if (!isTargetGridAction && !isTargetRowAction) {
                    //Save the row on last column of the data table. Do not save the row if focus is out of input file.
                    if (!isLastColumn || (isLastColumn && e.relatedTarget === null) || $target.hasClass("file-upload")) {
                        return;
                    }
                }
                self.options.timeoutCall(function () {
                    self.toggleEditRow(e, {
                        'action': 'save',
                        'noMsg': true,
                        'success': function (skipFocus, error, isNewRow) {
                            if (!isNewRow) {
                                self.editSuccessHandler(skipFocus, error, e, $row,false);
                            }
                        }
                    });
                });
            });
        }

        // row selection
        $htm.find('[data-identifier="rowExpansionButtons"]').off("click");
        $htm.find('[data-identifier="rowExpansionButtons"]').on('click', function (e) {
            var $row = $(e.target).closest('tr.app-datagrid-row');
            if ($(this).find('.app-button').attr('disabled')) {
                return;
            }
            self.toggleExpandRow(+$row.attr('data-row-id'), undefined, e);
        });
    },
    expandRow: function(rowId) {
        this.toggleExpandRow(rowId, true)
    },
    collapseRow: function(rowId) {
        this.toggleExpandRow(rowId, false)
    },
    hasAllClasses: function (element, classNames) { // function to check if all the class names are present in the element
        return classNames && classNames.every(cls => element.hasClass(cls));
    },
    _collapseRow: function(e, rowData, rowId, $nextDetailRow, $icon) {
        var self = this,
            $tbody = self.gridElement,
            $row = $($tbody.find('> tr.app-datagrid-row[data-row-id="'+ rowId +'"]'));
        $row.removeClass(self.options.cssClassNames.expandedRowClass);
        $row.find( 'button, a').attr('aria-expanded', 'false').attr('aria-live', 'polite');
        if (this.options.onBeforeRowCollapse(e, rowData, rowId) === false) {
            return;
        }
        if ($icon.length && this.hasAllClasses($icon, this.options.cssClassNames.rowExpandIcon?.split(' '))) {
            $icon.removeClass(this.options.cssClassNames.rowExpandIcon).addClass(this.options.cssClassNames.rowCollapseIcon);
        }
        $nextDetailRow.hide();
        this.options.onRowCollapse(e, rowData)
    },
    toggleExpandRow: function(rowId, isExpand, e) {
        var self = this,
            $tbody = self.gridElement,
            $row = $($tbody.find('> tr.app-datagrid-row[data-row-id="'+ rowId +'"]')),
            rowData = _.clone(self.options.data[rowId]),
            $nextDetailRow = $row.next('tr.app-datagrid-detail-row'),
            isClosed = !$nextDetailRow.is(':visible'),
            $icon = $row.find('[data-identifier="rowExpansionButtons"] i.app-icon'),
            expandRowBtn = $row.find( 'button, a');
        rowData.$index = rowId + 1;
        if (isExpand && !isClosed) {
            return;
        }
        if (isExpand === false && isClosed) {
            return;
        }
        if (isClosed) {
            $row.addClass(self.options.cssClassNames.expandedRowClass);
            if(self.options.rowDef.collapsetitle)  expandRowBtn.attr('title', self.options.rowDef.collapsetitle);
            else {
                    expandRowBtn.attr('title', expandRowBtn.attr('collapsetitle'));
            }
            $row.find( 'button, a').attr('aria-expanded', 'true');
            if (e && self.preparedData[rowId]._selected) {
                e.stopPropagation();
            }
            if (self.options.rowDef.closeothers) {
                $tbody.find('> tr.app-datagrid-detail-row:visible').each(function() {
                    var $otherDetailRow = $(this),
                        $otherIcon = $otherDetailRow.prev('tr.app-datagrid-row').find('[data-identifier="rowExpansionButtons"] i.app-icon'),
                        otherRowId = +$otherDetailRow.attr('data-row-id'),
                        otherRowData = self.options.data[otherRowId];
                    $otherDetailRow.hide();
                    self._collapseRow(e, otherRowData, otherRowId, $otherDetailRow, $otherIcon);
                });
            }
            self.options.generateRowDetailView(e, rowData, rowId, $nextDetailRow.find('td.app-datagrid-row-details-cell .details-section'),
                $nextDetailRow.find('td.app-datagrid-row-details-cell .row-overlay'), function () {
                    if ($icon.length && self.hasAllClasses($icon, self.options.cssClassNames.rowCollapseIcon?.split(' '))) {
                        $icon.removeClass(self.options.cssClassNames.rowCollapseIcon).addClass(self.options.cssClassNames.rowExpandIcon);
                    }
                    $nextDetailRow.show();
                });
        } else {
            if(self.options.rowDef.expandtitle) expandRowBtn.attr('title', self.options.rowDef.expandtitle);
            else {
                expandRowBtn.attr('title', expandRowBtn.attr('expandtitle'));
            }
            self._collapseRow(e, rowData, rowId, $nextDetailRow, $icon);
        }
    },
    /* Replaces all the templates needing angular compilation with the actual compiled templates. */
    _findAndReplaceCompiledTemplates: function () {
        if (!this.gridElement) {
            return;
        }
        var $compiledCells = this.gridElement.find('td[data-compiled-template]'),
            self = this;

        $compiledCells.each(function () {
            var $cell = $(this),
                id = $cell.attr('data-compiled-template');

            $cell.replaceWith(self.compiledCellTemplates[id]);
        });
    },

    /* Renders the search box. */
    _renderSearch: function () {
        var $htm = $(this._getSearchEl()),
            self = this,
            $searchBox;

        function search(e) {
            e.stopPropagation();
            var searchText = $htm.find('[data-element="dgSearchText"]')[0].value,
                $filterField = $htm.find('[data-element="dgFilterValue"]'),
                field = $filterField[0].value,
                colDefIndex = $htm.find('option:selected').attr('data-coldef-index'),
                colDef = self.options.colDefs[colDefIndex],
                type = colDef && colDef.type ? colDef.type : '';

            self.searchObj = {
                'field': field,
                'value': searchText,
                'type': type,
                'event': e
            };
            self.options.searchHandler.call(self, self.searchObj, e, 'search');
        }

        this.element.find('.form-search').remove();
        $htm.insertBefore(this.gridContainer);
        this.gridSearch = this.element.find('.form-search');

        $searchBox = this.gridSearch.find('[data-element="dgSearchText"]');
        this.gridSearch.find('.app-search-button').on('click', search);
        this.gridSearch.find('[data-element="dgFilterValue"]').on('change', function (e) {
            // If "No data found" message is shown, and user changes the selection, then fetch all data.
            if (self.dataStatusContainer.find('.status').text() === self.options.dataStates.nodata) {
                search(e);
            }
        });
        $searchBox.on('keyup', function (e) {
            e.stopPropagation();
            // If the search text is empty then show all the rows.
            if (!$(this).val()) {
                self.emptySearch = true;
                if (self.searchObj.value) {
                    self.searchObj.value = '';
                    search(e);
                }
            } else {
                self.emptySearch = false;
            }

            /* Search only when enter key is pressed. */
            if (e.which === 13 || self.options.filteronkeypress) {
                search(e);
            }
        });
    },
    //Generate the row level filter
    _renderRowFilter: function () {
        var $row = $('<tr class="filter-row"></tr>'),
            self = this,
            $headerElement = (this.options.isMobile && !this.options.showHeader) ? this.gridElement : this.gridHeaderElement;
        $headerElement.find('.filter-row').remove();
        this.options.generateFilterRow();
        this.preparedHeaderData.forEach(function (field, index) {
            var fieldName = field.field,
                $th = $('<th data-col-id="' + index + '"></th>');
            if (!field.searchable) {
                $row.append($th);
                return;
            }
            $th.append(self.options.getFilterWidget(fieldName));
            $row.append($th);
        }, this);
        if (this.options.showHeader) {
            this.gridHeaderElement.append($row);
        } else {
            if (this.options.isMobile) {
                $headerElement.empty().append($row);
            } else {
                $headerElement.empty().append($row);
            }
        }
        this.gridSearch = $headerElement.find('.filter-row');
    },
    /* Renders the table header. */
    _renderHeader: function () {
        var headerTemplate = this._getHeaderTemplate(),
            $colgroup = headerTemplate.colgroup,
            self = this,
            $header;
        /*On scroll of the content table, scroll the header*/
        this.gridElement.parent().scroll(function () {
            self.gridHeaderElement.parent().prop('scrollLeft', this.scrollLeft);
        });
        if (!this.options.showHeader) {
            this.tableContainer.append($colgroup);
            this.gridHeaderElement.hide();
            //this.gridElement.prepend($colgroup.clone());
            return;
        } else {
            this.gridHeaderElement.show();
        }
        $header = headerTemplate.header;

        function toggleSelectAll(e) {
            var $checkboxes = $('tr.app-datagrid-row:not(.always-new-row):visible td input[name="gridMultiSelect"]:checkbox', self.gridElement),
                checked = this.checked,
                $headerCheckbox = self.gridHeaderElement.find("th.app-datagrid-header-cell input:checkbox");
            $headerCheckbox.siblings('span.sr-only').text(checked ? 'All Rows Selected' : 'All Rows Deselected');
            $checkboxes.prop('checked', checked);
            $checkboxes.each(function () {
                var $row = $(this).closest('tr.app-datagrid-row'),
                    rowId = $row.attr('data-row-id'),
                    rowData = self.options.data[rowId];
                self.toggleRowSelection($row, checked, e, true);
                // If we enable multiselect and check header checkbox then updating selecteditem in datatable.
                self.options.assignSelectedItems(rowData, e, {
                    'rowId': rowId,
                    '_selected': self.preparedData[rowId]?._selected
                });
                if (checked && _.isFunction(self.options.onRowSelect)) {
                    self.options.onRowSelect(rowData, e);
                }
                if (!checked && _.isFunction(self.options.onRowDeselect)) {
                    self.options.onRowDeselect(rowData, e);
                }
            });
        }

        // WMS-17629: Hiding the table header column when show property is set to false
        var headerCells = $header.find("th.app-datagrid-header-cell");
        var headerCols = $colgroup.find('col');
        headerCells.each(function () {
            var id = Number($(this).attr('data-col-id')),
                colDef = self.preparedHeaderData[id],
                $headerCol = $(headerCols[id]);
            if (!colDef) {
                return;
            }
            if (!_.isUndefined(colDef.show) && !colDef.show) {
                //Hide the header and column if show is false
                $(this).hide();
                $headerCol.hide();
            }
        });

        /*For mobile view, append header to the main table only*/
        if (this.options.isMobile) {
            this.tableContainer.append($colgroup);
        } else {
            /**Append the colgroup to the header and the body.
             * Colgroup is used to maintain the consistent widths between the header table and body table**/
            this.tableContainer.append($colgroup);
            /**As jquery references the colgroup, clone the colgroup and add it to the table body**/
        }
        /**Add event handler, to the select all checkbox on the header**/
        $header.on('click', '.app-datagrid-header-cell input:checkbox', toggleSelectAll);
        $header.on('keydown', '.app-datagrid-header-cell input:checkbox', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault(); // Prevent default behavior

                // Simulate a click on the checkbox
                const checkbox = this;
                setTimeout(() => checkbox.click(), 0);
            }
        });

        if (_.isFunction(this.options.onHeaderClick)) {
            this.gridHeaderElement.find('th.app-datagrid-header-cell').on('click', this.headerClickHandler.bind(this));
            this.gridHeaderElement.find('th.app-datagrid-header-cell').on('keydown', function (e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    var $target = $(e.target);
                    // Only run if on the checkbox column
                    if ($target.attr('data-col-field') === 'checkbox') {
                        e.preventDefault();
                        // Trigger native click on the checkbox inside the header
                        $target.find('input[type="checkbox"]').trigger('click');
                    }
                }
            });
        }

        if (!this.options.isMobile && this.gridHeaderElement.length) {
            this.gridHeaderElement.find('th[data-col-resizable]').resizable({
                handles: 'e',
                minWidth: 50,
                // set COL width
                /* This is needed because if width is initially set on col from coldefs,
                 * then that column was not getting resized.*/
                resize: function (evt, ui) {
                    var $colElement,
                        $colHeaderElement,
                        $cellElements,
                        colIndex = +ui.helper.attr('data-col-id') + 1,
                        originalWidth = ui.helper.width(),
                        newWidth = ui.size.width,
                        originalTableWidth,
                        newTableWidth;
                    $colHeaderElement = self.tableContainer.find('colgroup > col:nth-child(' + colIndex + ')');
                    $colElement = self.tableContainer.find('colgroup > col:nth-child(' + colIndex + ')');
                    $cellElements = self.gridElement.find('tr.app-datagrid-row > td:nth-child(' + colIndex + ') > div');
                    $colElement.width(newWidth);
                    $colHeaderElement.width(newWidth);
                    $cellElements.width(newWidth);
                    // height must be set in order to prevent IE9 to set wrong height
                    $(this).css('height', 'auto');
                    /*Adjust the table width only if the column width is increased*/
                    if (newWidth > ui.originalSize.width) {
                        /*Increase or decrease table width on resizing the column*/
                        originalTableWidth = self.gridHeaderElement.width();
                        newTableWidth = originalTableWidth + newWidth - originalWidth;
                        self.gridHeaderElement.width(newTableWidth);
                        self.gridElement.width(newTableWidth);
                    }
                    self.addOrRemoveScroll();
                    self.options.redrawWidgets();
                }
            });
        }
        if(!this.isResetSortIconsDone) {
            this.setSortIconDefault();
        }
    },
    addOrRemoveScroll: function () {
        var gridContent = this.gridContainer.find('tbody'),
            gridHeader = this.gridContainer.find('.table-header');
        /*If scroll bar is present on the grid content, add padding to the header*/
        if ((gridContent.scrollHeight > gridContent.clientHeight) && !this.Utils.isMac()) {
            gridHeader.addClass('scroll-visible');
        } else {
            gridHeader.removeClass('scroll-visible');
        }
    },

    //Triggers actual function in scope
    _handleCustomEvents: function (e, options) {
        this.options.handleCustomEvents(e, options);
    },

    //Generates markup for row operations
    _setActionsEnabled: function () {
        var self = this;
        _.forEach(this.options.rowActions, function (def) {
            if (_.includes(def.action, 'editRow(')) {
                self.options.actionsEnabled.edit = true;
            } else if (_.includes(def.action, 'deleteRow(')) {
                self.options.actionsEnabled.delete = true;
            }
        });
    },

    //Appends row operations markup to grid template
    _appendRowActions: function ($htm, isNewRow, rowData) {
        var self,
            rowOperationsCol = this._getRowActionsColumnDef();
        if (this.options.rowActions.length || rowOperationsCol) {
            this._setActionsEnabled();
            self = this;
            $htm.find("[data-identifier='actionButtons']").each(function (index) {
                var _rowData, $row, rowId, rowIndex = index;
                if (isNewRow) {
                    _rowData = rowData;
                } else {
                    $row = $(this).closest('tr.app-datagrid-row');
                    rowId = parseInt($row.attr('data-row-id'), 10);
                    _rowData = _.clone(self.options.data[rowId]);
                    _rowData.$index = rowIndex + 1;
                }
                self.options.generateRowActions(_rowData, rowIndex);
                $(this).empty().append(self.options.getRowAction(rowIndex));
            });
        }
    },
    /* Renders the table body. */
    _renderGrid: function (isCreated) {
        var $htm, isScrollorOnDemand = this.options.isNavTypeScrollOrOndemand(), pageStartIndex = this.getPageStartIndex();
        $('table.table-bordered').parents('.app-grid-header-inner').addClass('table_border');
        if(isScrollorOnDemand) {
            var $tbody = this.gridElement;
            // get markup for new rows and append it to tbod
            var template = this._getGridTemplate();
            $htm = $(template);
            if (template && !$tbody.length) {
                // initally append tbody to gridElement
                this.gridElement.append($htm);
            }

        } else {
            var templates = this._getGridTemplate();
            $htm = $(templates);
            if(templates) {
                this.gridElement.append($htm);
            }
        }

        if (this.options.summaryRow) {
            var $summaryRowHtm = $(this._getSummaryRowTemplate());
            this.tableContainer.find('tfoot').remove();
            if (this.options.data.length){
                this.tableContainer.append($summaryRowHtm);
            }
        }
        // Set proper data status messages after the grid is rendered.
        if (!this.options.data.length && this.dataStatus.state === 'nodata') {
            this.setStatus('nodata');
        } else {
            this.dataStatus.state = this.dataStatus.state || 'loading';
            this.dataStatus.message = this.dataStatus.message || this.options.dataStates.loading;
            this.setStatus(this.dataStatus.state, this.dataStatus.message, isCreated);
        }
        this.gridBody = this.gridElement.find('tbody');
        this.gridFooter = this.tableContainer.find('tfoot');
        this._findAndReplaceCompiledTemplates();
        this.options.clearRowActions();
        // attach event handlers
        this._appendRowExpansionButtons($htm);
        this._appendRowActions($htm);
        this.attachEventHandlers($htm);
        this.__setStatus(isCreated);
        //Add new row, if always show new row is present for quick edit
        if (this.options.editmode === this.CONSTANTS.QUICK_EDIT && this.options.showNewRow) {
            this.addNewRow(false, true);
        }
        if (isCreated) {
            this._setColSpan(this.options.headerConfig);
        }
        if (_.isFunction(this.options.onDataRender)) {
            this.options.onDataRender();
        }
        if (!isCreated && this.options.selectFirstRow) {
            if (this.options.multiselect) {
                //Set selectFirstRow to false, to prevent first item being selected in next page
                this.options.selectFirstRow = false;
            }
            if (this.gridElement.find('tr.app-datagrid-row.active').length <= 0) {
                this.selectFirstRow(true, true);
            }
        }
    },

    /* Renders the table container. */
    _render: function (isCreated) {
        if (!this.tableId) {
            this.tableId = this.Utils.generateGuid();
        }
        var overflow = (this.options.isNavTypeScrollOrOndemand() && (this.options.height === '100%' || this.options.height === 'auto')) ? 'hidden' : 'auto';
        var statusContainer =
                '<div class="overlay">' +
                '<div class="status"><i class="' + this.options.loadingicon + '"></i><span class="message"></span></div>' +
                '</div>',

            table = '<div class="table-container table-responsive">' +
                '<div class="app-grid-header">' +
                '<div class="app-grid-header-inner">' +
                '<table tabindex="0" class="' + this.options.cssClassNames.gridDefault + ' ' + this.options.cssClassNames.grid + '">' +
                '<thead class="table-header thead-sticky" id="table_header_' + this.tableId + '" role="rowgroup">' +
                '</thead><tbody class="app-grid-content app-datagrid-body"  id="table_' + this.tableId + '" role="rowgroup">' +
                '</tbody></table>' +
                '</div></div></div>',
            $statusContainer = $(statusContainer),
            $tableContainer = this.element.find('.table-container');
        this.gridContainer = $(table);
        this.gridHeaderElement = this.gridContainer.find('.table-header');
        this._setStyles($statusContainer.find('div.overlay'), "display:none");
        this._setStyles(this.gridContainer.find('div.app-grid-header-inner'), 'height:' + this.options.height + '; overflow: auto;');
        this.tableContainer = this.gridContainer.find('table');
        this.gridElement = this.gridContainer.find('.app-grid-content');


        if ((this.options.isNavTypeScrollOrOndemand() && (!$tableContainer.length || !this.options.isNextPageData)) || (!this.options.isNavTypeScrollOrOndemand())) {
            this.element.find('.table-container').remove();
            this.element.append(this.gridContainer);

        }
        //  Fix for [WMS-23263]: reset the 'isNextPageData' flag

        this.options.setIsNextPageData(false);

        // Fix for [WMS-23263]: Adding data status container
        if (!this.gridContainer.find('.overlay').length) {
            this.dataStatusContainer = $(statusContainer);
            this.gridContainer.append(this.dataStatusContainer);
        }

        //  Fix for [WMS-23263]: clear the header template for removing existing colgroup in case of dynamictable
        if (this.gridHeaderElement) {
            this.gridHeaderElement.empty();
            this.gridElement.find('colgroup').remove();
        }
        this._renderHeader();
        if (this.options.filtermode === this.CONSTANTS.SEARCH && (_.isEmpty(this.searchObj) || (this.searchObj && !this.searchObj.field && !this.searchObj.value))) {
            this._renderSearch();
        } else if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN) {
            this._renderRowFilter();
        }
        if (this.options.spacing === 'condensed') {
            this._toggleSpacingClasses('condensed');
        }
        this._renderGrid(isCreated);
        this.addNavigationControls();
    },
    addNavigationControls: function() {
        /**
         * bind on demand / scroll events to the table in case of dynamictable in render fn
         * Render is called everytime when there is a change in dataset and the previously binded events are lost
         */
        if (this.options.isdynamictable) {
            this.element.find('.on-demand-datagrid').remove();
            if (this.options.navigation === 'On-Demand' && (!this.element.find('.on-demand-datagrid').length)) {
                this.options.addLoadMoreBtn();
            } else if (this.options.navigation === 'Scroll') {
                this.options.bindScrollEvt();
            }
        }
    },
    __setStatus: function (isCreated) {
        var loadingIndicator = this.dataStatusContainer.find('i'),
            state = this.dataStatus.state,
            isScrollOrOndemand = this.options.isNavTypeScrollOrOndemand();
        this.dataStatusContainer.find('.message').text(this.dataStatus.message);
        if (state === 'loading') {
            loadingIndicator.removeClass('hidden');
        } else {
            loadingIndicator.addClass('hidden');
        }
        if (state === 'ready') {
            this.dataStatusContainer.hide();
        } else {
            // [WMS-23839] always show load more btn if show view less btn is true
            if (this.options.isNavTypeScrollOrOndemand() && (state === 'nodata' || ((this.options.getCurrentPage() == this.options.getPageCount())  && !this.options.showviewlessbutton))) {
                this.element.find('.on-demand-datagrid a').hide();
            }
            this.dataStatusContainer.show();
        }
        if (state === 'nodata' || state === 'loading' || state === 'error') {
            if (this.options.height === '100%' || this.options.height === 'auto') { //If height is auto or 100%, Set the loading overlay height as present grid content height
                if (state === 'nodata') {
                    this.dataStatusContainer.css('height', 'auto');
                    this.dataStatus.contentHeight = 0;
                }  else if (this.options.isNavTypeScrollOrOndemand() && this.options.getCurrentPage() > 1){
                    // showing the loading icon only for the first page
                    // from second page there is another loader which is being shown instead of LoadMore btn
                    this.dataStatusContainer.hide();
                } else {
                    this.dataStatus.height = this.dataStatus.height || this.dataStatusContainer.outerHeight();
                    this.dataStatus.contentHeight = this.gridElement.outerHeight() || this.dataStatus.contentHeight;
                    this.dataStatusContainer.css('height', this.dataStatus.height > this.dataStatus.contentHeight ? 'auto' : this.dataStatus.contentHeight);
                }
            }
            if (!isScrollOrOndemand || (isScrollOrOndemand && this.options.getCurrentPage() === 1)) {
                this.gridContainer.addClass("show-msg");
            }
        } else {
            this.gridContainer.removeClass('show-msg');

            // In case of quickeditmode, if active row is found, focus the row and bind the event listeners to the row
            if (this.options.editmode === this.CONSTANTS.QUICK_EDIT) {
                if (this.options.activeRow) {
                    this.attachHandlersToActiveRow(this.options.activeRow);
                }
                this.options.activeRow = undefined;
            }
        }
        if (!isCreated) {
            this.setColGroupWidths();
        }
        this.addOrRemoveScroll();
    },
    /**
     *
     * @param {*} rowObj Contains the object which is part of options.data
     * In this method, active row will be focused and event handlers are attached.
     * If object is recieved, node extraction will be done and if found operations on the row are performed
     */
    attachHandlersToActiveRow(rowObj) {
        var rowIndex = this.Utils.getObjectIndex(this.options.data, rowObj);
        var row = this.gridElement.find('tr.app-datagrid-row[data-row-id=' + rowIndex + ']');
        if (!row.length) {
            return;
        } else if (!row.hasClass('active')) {
            row.addClass('active');
        }
        this.focusActiveRow();
        this.attachEventHandlers(row);
    },
    // This method sets the activerow on which save operation is performed in quickeditmode
    setActiveRow(row) {
        this.options.activeRow = row;
    },
    //This method is used to show or hide data loading/ no data found overlay
    setStatus: function (state, message, isCreated) {
        var $newRow;
        //If state is nodata and always new row is present, change state to ready
        if (state === 'nodata') {
            $newRow = this.gridElement && this.gridElement.find('tr.app-datagrid-row.always-new-row');
            state = ($newRow && $newRow.length) ? 'ready' : state;
        }

        this.dataStatus.state = state;
        this.options.setGridState(state);
        this.dataStatus.message = message || this.options.dataStates[state];
        //First time call the status function, afterwards use debounce with 100 ms wait
        if (this._setStatusCalled) {
            this._setStatus(isCreated);
        } else {
            this.__setStatus(isCreated);
            this._setStatusCalled = true;
        }
    },

    setGridDimensions: function (key, value) {
        if (value.indexOf('px') === -1 && value.indexOf('%') === -1 && value.indexOf('em') === -1 && value != 'auto') {
            value = value + 'px';
        }
        this.options[key] = value;
        if (key === 'height') {
            //  if(this.dataStatus.state != 'loading') {
            var elements = this.gridHeaderElement.find('th');
            // this._setStyles(this.tableContainer, 'border-collapse: separate;');

            // for (var i = 0; i < elements.length; i += 1) {
            //     this._setStyles($(elements[i]), 'border: 1px solid #eee');
            // }
            //}
            this.gridContainer.find('.app-grid-header-inner').css(key, value);
            // this.gridContainer.find('.app-grid-header-inner').css('border', '1px solid #eee');
            if (this.options.isNavTypeScrollOrOndemand() && (this.options.height != '100%' && this.options.height != 'auto')) {
                this.gridContainer.find('.app-grid-header-inner').css('overflow', 'auto');
            }
            this.dataStatusContainer.css(key, value);
        }
        this.addOrRemoveScroll();
    },
    /*Change the column header title. function will be called if display name changes in runmode*/
    setColumnProp: function (fieldName, property, val, isGroup) {
        var $col;
        if (property === 'displayName') {
            if (isGroup) {
                $col = this.gridHeaderElement.find('th[data-col-group="' + fieldName + '"]');
            } else {
                $col = this.gridHeaderElement.find('th[data-col-field="' + fieldName + '"]');
            }
            $col.attr('title', val);
            $col.find('.header-data').html(val);

            //Change the display name in the search filter options
            if (this.options.filtermode === this.CONSTANTS.SEARCH && this.gridSearch) {
                this.gridSearch.find('select option[value="' + fieldName + '"]').text(val);
            }
        }
    },

    applyRowNgClass: function (val, index) {
        var $row = this.gridElement.find('tr.app-datagrid-row[data-row-id="' + index + '"]');
        $row.removeClass(val.toRemove);
        $row.addClass(val.toAdd);
    },

    applyColNgClass: function (val, rowIndex, colIndex) {
        var $cell = this.gridElement.find('tr.app-datagrid-row[data-row-id="' + rowIndex + '"] td.app-datagrid-cell[data-col-id="' + colIndex + '"]');
        var $head = this.tableContainer.find('thead tr th.app-datagrid-header-cell[data-col-id="' + colIndex + '"]');
        $cell.removeClass(val.toRemove);
        $cell.addClass(val.toAdd);
        $head.removeClass(val.toRemove);
        $head.addClass(val.toAdd);
    },

    _destroy: function () {
        this.element.text('');
        window.clearTimeout(this.refreshGridTimeout);
    }
});
