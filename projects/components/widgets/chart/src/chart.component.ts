import { AfterViewInit, OnDestroy, Component, HostBinding, Injector, ViewEncapsulation } from '@angular/core';

import { App, DataSource, getClonedObject, isDataSourceEqual, isEmptyObject, isNumberType, prettifyLabels, removeAttr, triggerFn, isMobileApp, noop } from '@wm/core';
import { APPLY_STYLES_TYPE, IRedrawableComponent, provideAsWidgetRef, StylableComponent, styler,  } from '@wm/components/base';

import { registerProps } from './chart.props';
import { allShapes, getDateList, getSampleData, initChart, isAreaChart, isAxisDomainValid, isBarChart, isBubbleChart, isChartDataArray, isChartDataJSON, isLineTypeChart, isPieType, postPlotChartProcess } from './chart.utils';

declare const $, _, d3, nv;

const WIDGET_CONFIG = {widgetType: 'wm-chart', hostClass: 'app-chart'};

const options = {
        'Bubble' : ['bubblesize', 'shape']
    },
    NONE = 'none',
    advanceDataProps = ['aggregation', 'aggregationcolumn', 'groupby', 'orderby'],
    // XPaths to get actual data of data points in charts
    chartDataPointXpath = {
        'Column'         : 'rect.nv-bar',
        'Bar'            : 'g.nv-bar',
        'Area'           : '.nv-stackedarea .nv-point',
        'Cumulative Line': '.nv-cumulativeLine .nv-scatterWrap path.nv-point',
        'Line'           : '.nv-lineChart .nv-scatterWrap path.nv-point',
        'Pie'            : '.nv-pieChart .nv-slice path',
        'Donut'          : '.nv-pieChart .nv-slice path',
        'Bubble'         : '.nv-scatterChart .nv-point-paths path'
    },
    // all properties of the chart
    allOptions = ['bubblesize', 'shape'],
    styleProps = {
        'fontunit'      : 'font-size',
        'fontsize'      : 'font-size',
        'color'         : 'fill',
        'fontfamily'    : 'font-family',
        'fontweight'    : 'font-weight',
        'fontstyle'     : 'font-style',
        'textdecoration': 'text-decoration'
    },
    // Getting the relevant aggregation function based on the selected option
    aggregationFnMap = {
        'average' : 'AVG',
        'count'   : 'COUNT',
        'maximum' : 'MAX',
        'minimum' : 'MIN',
        'sum'     : 'SUM'
    };

const getBooleanValue = val => {
    if (val === true || val === 'true') {
        return true;
    }
    if (val === false || val === 'false') {
        return false;
    }
    return val;
};

// returns orderby columns and their orders in two separate arrays
const getLodashOrderByFormat = orderby => {
    let columns;
    const orderByColumns = [],
        orders = [];

    _.forEach(_.split(orderby, ','), function (col) {
        columns = _.split(col, ':');
        orderByColumns.push(columns[0]);
        orders.push(columns[1]);
    });
    return {
        'columns' : orderByColumns,
        'orders'  : orders
    };
};

// Replacing the '.' by the '$' because '.' is not supported in the alias names
const getValidAliasName = aliasName => aliasName ? aliasName.replace(/\./g, '$') : null;

// Applying the font related styles for the chart
const setTextStyle = (properties, id) => {
    const charttext = d3.select('#wmChart' + id + ' svg').selectAll('text');
    charttext.style(properties);
};

const angle = d => {
    const a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
};

@Component({
    selector: 'div[wmChart]',
    templateUrl: './chart.component.html',
    styleUrls: ['../../../../../node_modules/@wavemaker.com/nvd3/build/nv.d3.min.css'],
    providers: [
        provideAsWidgetRef(ChartComponent)
    ],
    encapsulation: ViewEncapsulation.None
})
export class ChartComponent extends StylableComponent implements AfterViewInit, OnDestroy, IRedrawableComponent {
    static initializeProps = registerProps();

    xaxisdatakey;
    yaxisdatakey;
    groupby;
    aggregation;
    aggregationcolumn;
    isVisuallyGrouped;
    orderby;
    iconclass = '';
    type: string;
    showContentLoadError;
    invalidConfig;
    errMsg;
    shape: string;
    datasource: any;
    fontsize: string;
    selecteditem: any;
    fontunit: string;
    offsettop: number;
    offsetleft: number;
    offsetright: number;
    offsetbottom: number;
    showlabels: any;
    theme: string;

    private $id;
    private scopedataset: any;
    private binddataset: any;
    private showlabelsoutside: any;
    private _resizeFn: any;
    private chart: any;
    private clearCanvas: boolean;
    public isLoadInProgress: boolean;
    private filterFields: boolean | any;
    private dataset: any;
    private axisoptions: any;
    private numericColumns: any;
    private nonPrimaryColumns: any = [];
    private variableInflight: any;
    private chartReady: boolean;
    private xDataKeyArr: any = [];
    private xAxisDataType: string;
    private bubblesize: any;
    public showNoDataMsg: any;
    private sampleData: any[];
    private chartData: any[] = [];
    private _processedData: any[] = [];
    private _subsciptions: any = [];

    @HostBinding('class.panel') title;

    isGroupByEnabled() {
        return !!(this.groupby && this.groupby !== NONE);
    }

    // Check if x and y axis that are chosen are valid to plot chart
    isValidAxis() {
        // Check if x axis and y axis are chosen and are not equal
        return this.binddataset ? (this.xaxisdatakey && this.yaxisdatakey) : true;
    }

    // Check if aggregation is chosen
    isAggregationEnabled() {
        return !!((this.isGroupByEnabled() && this.aggregation !== NONE && this.aggregationcolumn));
    }

    // Check if either groupby, aggregation or orderby is chosen
    isDataFilteringEnabled() {
        /*Query need to be triggered if any of the following cases satisfy
        * 1. Group By and aggregation both chosen
        * 2. Only Order By is chosen
        * */

        return this.isAggregationEnabled() || (!this.isVisuallyGrouped && this.orderby);
    }

    /*Charts like Line,Area,Cumulative Line does not support any other datatype
        other than integer unlike the column and bar.It is a nvd3 issue. Inorder to
        support that this is a fix*/
    getxAxisVal(dataObj, xKey, index) {
        const value = _.get(dataObj, xKey);
        // If x axis is other than number type then add indexes
        if (isLineTypeChart(this.type) && !isNumberType(this.xAxisDataType)) {
            // Verification to get the unique data keys
            this.xDataKeyArr.push(value);
            return index;
        }
        return value;
    }

    // Getting the min and max values among all the x values
    getXMinMaxValues(datum) {
        if (!datum) {
            return;
        }
        const xValues: any = {};
        /*
         compute the min x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            min x: 1
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            min x: 10
        */
        xValues.min = _.minBy(datum.values, dataObject => dataObject.x || dataObject[0]);
        /*
         compute the max x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            max x: 3
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            max x: 30
         */
        xValues.max = _.maxBy(datum.values, dataObject => dataObject.x || dataObject[0]);
        return xValues;
    }

    // Getting the min and max values among all the y values
    getYMinMaxValues(datum) {
        const yValues: any = {},
            minValues = [],
            maxValues = [];
        if (!datum) {
            return;
        }

        /*
         Getting the min and max y values among all the series of data
         compute the min y value
         eg: When data has objects
            input: [[{x:1, y:2}, {x:2, y:3}, {x:3, y:4}], [{x:2, y:3}, {x:3, y:4}, {x:4, y:5}]]
            min y values : '2'(among first set) & '3'(among second set)
            max y values : '4'(among first set) & '5'(among second set)

         eg: When data has arrays
            input: [[[10, 20], [20, 30], [30, 40]], [[20, 30], [30, 40], [40, 50]]]
            min y values : '20'(among first set) & '30'(among second set)
            max y values : '40'(among first set) & '50'(among second set)
         */

        _.forEach(datum, data => {
            minValues.push(_.minBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
            maxValues.push(_.maxBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
        });
        // Gets the least and highest values among all the min and max values of respective series of data
        yValues.min = _.minBy(minValues, dataObject => dataObject.y || dataObject[1]);
        yValues.max = _.maxBy(maxValues, dataObject => dataObject.y || dataObject[1]);
        return yValues;
    }

    // If the x-axis values are undefined, we return empty array else we return the values
    getValidData(values) {
        return (values.length === 1 && values[0] === undefined) ? [] : values;
    }

    // Returns the single data point based on the type of the data chart accepts
    valueFinder(dataObj, xKey, yKey, index?, shape?) {
        const xVal = this.getxAxisVal(dataObj, xKey, index),
            value = _.get(dataObj, yKey),
            yVal = parseFloat(value) || value,
            size = parseFloat(dataObj[this.bubblesize]) || 2;
        let dataPoint: any = {};

        if (isChartDataJSON(this.type)) {
            dataPoint.x = xVal;
            dataPoint.y = yVal;
            // only Bubble chart has the third dimension
            if (isBubbleChart(this.type)) {
                dataPoint.size = size;
                dataPoint.shape = shape || 'circle';
            }
        } else if (isChartDataArray(this.type)) {
            dataPoint = [xVal, yVal];
        }
        // Adding actual unwrapped data to chart data to use at the time of selected data point of chart event
        dataPoint._dataObj = dataObj;
        return dataPoint;
    }

    // Setting appropriate error messages
    setErrMsg(message) {
        if (this.showNoDataMsg) {
            this.showContentLoadError = true;
            this.invalidConfig = true;
            // TODO: Set the locale from the message
            this.errMsg = ''; // $rootScope.locale[message];
        }
    }

    processChartData() {
        this.sampleData = getSampleData(this);
        // scope variables used to keep the actual key values for x-axis
        this.xDataKeyArr = [];
        // Plotting the chart with sample data when the chart dataset is not bound
        if (!this.binddataset) {
            this.xDataKeyArr = getDateList();
            return this.sampleData;
        }

        if (!this.chartData || !this.chartData.length) {
            return [];
        }

        let datum = [],
            yAxisKey,
            shapes: any = [],
            values: any = [];
        const xAxisKey = this.xaxisdatakey,
            yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [],
            dataSet = this.chartData;

        if (_.isArray(dataSet)) {
            if (isPieType(this.type)) {
                yAxisKey = yAxisKeys[0];
                datum = _.map(dataSet, (dataObj, index) => {
                    if (!isEmptyObject(dataSet[index])) {
                        return this.valueFinder(dataSet[index], xAxisKey, yAxisKey);
                    }
                });
                datum = this.getValidData(datum);
            } else {
                if (isBubbleChart(this.type)) {
                    shapes = this.shape === 'random' ? allShapes : this.shape;
                }
                yAxisKeys.forEach((yAxisKey, series) => {
                    values =  _.map(dataSet, (dataObj, index) => {
                        if (!isEmptyObject(dataSet[index])) {
                            return this.valueFinder(dataSet[index], xAxisKey, yAxisKey, index, (_.isArray(shapes) && shapes[series]) || this.shape);
                        }
                    });
                    values = this.getValidData(values);
                    datum.push({
                        values: values,
                        key: prettifyLabels(yAxisKey)
                    });
                });
            }
        }
        return datum;
    }

    setChartData(data) {
        if (data) {
            this._processedData = data;
        }
    }

    getChartData() {
        return this._processedData;
    }

    // constructing the grouped data based on the selection of orderby, x & y axis
    getVisuallyGroupedData(queryResponse, groupingColumn) {
        let groupData: any = {},
            groupValues: any = [],
            orderByDetails,
            maxLength;
        const chartData: any = [],
            _isAreaChart = isAreaChart(this.type),
            yAxisKey = _.first(_.split(this.yaxisdatakey, ','));
        this.xDataKeyArr = [];
        queryResponse = _.orderBy(queryResponse, _.split(this.groupby, ','));
        if (this.orderby) {
            orderByDetails = getLodashOrderByFormat(this.orderby);
            queryResponse = _.orderBy(queryResponse, orderByDetails.columns, orderByDetails.orders);
        }
        queryResponse = _.groupBy(queryResponse, groupingColumn);
        // In case of area chart all the series data should be of same length
        if (_isAreaChart) {
            maxLength = _.max(_.map(queryResponse, obj => obj.length));
        }
        _.forEach(queryResponse, (values, groupKey) => {
            groupValues = isAreaChart ? _.fill(new Array(maxLength), [0, 0]) : [];
            _.forEachRight(values, (value, index) => {
                groupValues[index] = this.valueFinder(value, this.xaxisdatakey, yAxisKey, index);
            });
            groupData = {
                key : groupKey,
                values : groupValues
            };
            chartData.push(groupData);
        });
        return chartData;
    }

    /*Decides whether the data should be visually grouped or not
            Visually grouped when a different column is choosen in the group by other than x and y axis and aggregation is not chosen*/
    getGroupingDetails() {
        if (this.isGroupByEnabled() && !this.isAggregationEnabled()) {
            let isVisuallyGrouped = false,
                visualGroupingColumn,
                groupingExpression,
                columns: any = [],
                groupingColumnIndex;
            const groupbyColumns = this.groupby && this.groupby !== NONE ? this.groupby.split(',') : [],
                yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [];

            if (groupbyColumns.length > 1) {
                /*Getting the group by column which is not selected either in x or y axis*/
                groupbyColumns.every((column, index) => {
                    if (this.xaxisdatakey !== column && $.inArray(column, yAxisKeys) === -1) {
                        isVisuallyGrouped = true;
                        visualGroupingColumn = column;
                        groupingColumnIndex = index;
                        groupbyColumns.splice(groupingColumnIndex, 1);
                        return false;
                    }
                    return true;
                });
                // Constructing the groupby expression
                if (visualGroupingColumn) {
                    columns.push(visualGroupingColumn);
                }

                if (groupbyColumns.length) {
                    columns = _.concat(columns, groupbyColumns);
                }
            }
            // If x and y axis are not included in aggregation need to be included in groupby
            if (this.xaxisdatakey !== this.aggregationcolumn) {
                columns.push(this.xaxisdatakey);
            }
            _.forEach(yAxisKeys, key => {
                if (key !== this.aggregationcolumn) {
                    columns.push(key);
                }
            });
            groupingExpression =  columns.join(',');
            // set isVisuallyGrouped flag in scope for later use
            this.isVisuallyGrouped = isVisuallyGrouped;

            return {
                expression: groupingExpression,
                isVisuallyGrouped: isVisuallyGrouped,
                visualGroupingColumn: visualGroupingColumn
            };
        }
        return {
            expression: '',
            isVisuallyGrouped: false,
            visualGroupingColumn: ''
        };
    }

    // Function to get the aggregated data after applying the aggregation & group by or order by operations.
    getAggregatedData(callback) {
        const variable: any = this.datasource,
            yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [],
            data: any = {};
        let sortExpr,
            columns: any = [],
            colAlias,
            orderByColumns,
            groupByFields: any = [];

        if (!variable) {
            return;
        }
        if (this.isGroupByEnabled()) {
            groupByFields = _.split(this.groupby, ',');
        }
        if (this.orderby) {
            sortExpr = _.replace(this.orderby, /:/g, ' ');
            columns = _.uniq(_.concat(columns, groupByFields, [this.aggregationcolumn]));
            orderByColumns = getLodashOrderByFormat(this.orderby).columns;
            // If the orderby column is chosen either in groupby or orderby then replace . with $ for that column
            _.forEach(_.intersection(columns, orderByColumns), col => {
                colAlias = getValidAliasName(col);
                sortExpr = _.replace(sortExpr, col, colAlias);
            });
        }
        if (this.isAggregationEnabled()) {
            // Send the group by in the aggregations api only if aggregation is also chosen
            data.groupByFields = groupByFields;
            data.aggregations =  [
                {
                    'field': this.aggregationcolumn,
                    'type':  aggregationFnMap[this.aggregation],
                    'alias': getValidAliasName(this.aggregationcolumn)
                }
            ];
        }
        // Execute the query.
        variable.execute('getAggregatedData', {
            'aggregations' : data,
            'sort'         : sortExpr
        }).then(response => {
            // Transform the result into a format supported by the chart.
            const chartData: any = [],
                aggregationAlias: any = getValidAliasName(this.aggregationcolumn),
                xAxisAliasKey = getValidAliasName(this.xaxisdatakey),
                yAxisAliasKeys = [];

            yAxisKeys.forEach(yAxisKey => yAxisAliasKeys.push(getValidAliasName(yAxisKey)));

            _.forEach(response.body.content, (responseContent) => {
                const obj = {};
                // Set the response in the chartData based on 'aggregationColumn', 'xAxisDataKey' & 'yAxisDataKey'.
                if (this.isAggregationEnabled()) {
                    obj[this.aggregationcolumn] = responseContent[aggregationAlias];
                    obj[this.aggregationcolumn] = _.get(responseContent, aggregationAlias) || _.get(responseContent, this.aggregationcolumn);
                }

                obj[this.xaxisdatakey] = _.get(responseContent, xAxisAliasKey) || _.get(responseContent, this.xaxisdatakey);

                yAxisKeys.forEach((yAxisKey, index) => {
                    obj[yAxisKey] = responseContent[yAxisAliasKeys[index]];
                    obj[yAxisKey] = _.get(responseContent, yAxisAliasKeys[index]) || _.get(responseContent, yAxisKey);
                });

                chartData.push(obj);
            });

            this.chartData = chartData;

            triggerFn(callback);
        }, () => {
            this.chartData = [];
            this.setErrMsg('MESSAGE_ERROR_FETCH_DATA');
            triggerFn(callback);
        });
    }

    // This function sets maximum width for the labels that can be displayed.This will helpful when they are overlapping
    setLabelsMaxWidth() {
        let xTicks,
            tickWidth,
            maxLength,
            xDist,
            yDist,
            totalHeight,
            maxNoLabels,
            nthElement,
            labelsAvailableWidth,
            barWrapper,
            yAxisWrapper,
            svgWrapper;
        const fontsize = parseInt(this.fontsize, 10) || 12,
            isBarchart = isBarChart(this.type);
        // getting the x ticks in the chart
        xTicks = $('#wmChart' + this.$id + ' svg').find('g.nv-x').find('g.tick').find('text');

        // getting the distance between the two visible ticks associated with visible text
        xTicks.each(function () {
            const xTick = $(this);
            let xTransform,
                tickDist;
            if (xTick.text() && xTick.css('opacity') === '1') {
                xTransform = xTick.parent().attr('transform').split(',');
                xDist = parseFloat(xTransform[0].substr(10));
                yDist = parseFloat(xTransform[1] || '0');
                if (!isBarchart && xDist > 0) {
                    tickDist = xDist;
                } else if (yDist > 0) {
                    tickDist = yDist;
                }
                if (tickWidth) {
                    tickWidth = tickDist - tickWidth;
                    return false;
                }
                tickWidth = tickDist;
                return true;
            }
        });

        // In case of bar chart getting the available space for the labels to be displayed
        if (isBarchart) {
            barWrapper = $('#wmChart' + this.$id + ' svg>g.nv-wrap>g>g.nv-barsWrap')[0];
            yAxisWrapper = $('#wmChart' + this.$id + ' svg>g.nv-wrap>g>g.nv-y')[0];
            svgWrapper = $('#wmChart' + this.$id + ' svg')[0];
            // getting the total height of the chart
            totalHeight = barWrapper ? barWrapper.getBoundingClientRect().height : 0;
            // getting the labels available space
            labelsAvailableWidth = yAxisWrapper ? svgWrapper.getBoundingClientRect().width - yAxisWrapper.getBoundingClientRect().width : svgWrapper.getBoundingClientRect().width;
            // Setting the max length for the label
            maxLength = Math.round(labelsAvailableWidth / fontsize);
            // if available space for each label is less than the font-size
            // then limiting the labels to be displayed
            if (tickWidth < fontsize) {
                // calculate the maximum no of labels to be fitted
                maxNoLabels = totalHeight / fontsize;
                // showing only the nth element
                nthElement = Math.ceil(this.chartData.length / maxNoLabels);
                // showing up only some labels
                d3.select('#wmChart' + this.$id + ' svg').select('g.nv-x').selectAll('g.tick').select('text').each(function (text, i) {
                    // hiding every non nth element
                    if (i % nthElement !== 0) {
                        d3.select(this).attr('opacity', 0);
                    }
                });
            }
        } else {
            // Setting the max length for the label
            maxLength = Math.round(tickWidth / fontsize);
        }

        // maxLength should always be a positive number
        maxLength = Math.abs(maxLength);
        // Validating if every label exceeds the max length and if so limiting the length and adding ellipsis
        xTicks.each(function () {
            if (this.textContent.length > maxLength) {
                this.textContent = this.textContent.substr(0, maxLength) + '...';
            }
        });
    }

    // Returns the columns of that can be choosen in the x and y axis
    getDefaultColumns() {
        let type,
            stringColumn,
            i,
            temp;
        const defaultColumns = [],
            columns = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP) || [];

        for (i = 0; i < columns.length && defaultColumns.length <= 2; i += 1) {
            type = columns[i].type;
            if (!columns[i].isRelated && (isNumberType(type))) {
                defaultColumns.push(columns[i].fieldName);
            } else if (type === 'string' && !stringColumn) {
                stringColumn = columns[i].fieldName;
            }
        }
        // Other than bubble chart x: string type y: number type
        // Bubble chart x: number type y: number type
        if (stringColumn && defaultColumns.length > 0 && !isBubbleChart(this.type)) {
            temp = defaultColumns[0];
            defaultColumns[0] = stringColumn;
            defaultColumns[1] = temp;
        }

        return defaultColumns;
    }

    // Call user defined javascript function when user links it to click event of the widget.
    attachClickEvent() {
        let dataObj;
        d3.select('#wmChart' + this.$id + ' svg').selectAll(chartDataPointXpath[this.type]).style('pointer-events', 'all')
            .on('click', (data, index) => {
                switch (this.type) {
                    case 'Column':
                    case 'Bar':
                        dataObj = data._dataObj;
                        break;
                    case 'Pie':
                    case 'Donut':
                        dataObj = data.data._dataObj;
                        break;
                    case 'Area':
                    case 'Cumulative Line':
                    case 'Line':
                        dataObj = data[0]._dataObj;
                        break;
                    case 'Bubble':
                        dataObj = data.data.point[4]._dataObj;
                        break;
                }
                this.selecteditem = dataObj;
                this.invokeEventCallback('select', {$event: d3.event, selectedChartItem: data, selectedItem: this.selecteditem});
            });
            
    }

    /*  Returns Y Scale min value
           Ex: Input   : 8.97
               Output  : 8.87

               Input   : 8
               Output  : 7
       */

    postPlotProcess(chart) {
        let chartSvg,
            pieLabels,
            pieGroups,
            angleArray;
        const styleObj = {};
        const element = this.$element;

        postPlotChartProcess(this);

        if (!isPieType(this.type)) {
            this.setLabelsMaxWidth();
        } else if (!this.showlabelsoutside) {
            /** Nvd3 has a issue in rotating text. So we will use this as a temp fix.
             * If the issue is resolved there, we can remove this.*/
            /* If it is a donut chart, then rotate the text and position them*/
            chartSvg = d3.select('#wmChart' + this.$id + ' svg');
            pieLabels = chartSvg.select('.nv-pieLabels').selectAll('.nv-label');
            pieGroups = chartSvg.select('.nv-pie').selectAll('.nv-slice');
            angleArray = [];
            if (pieGroups && pieGroups.length) {
                pieGroups.each(function () {
                    d3.select(this).attr('transform', function (d) {
                        angleArray.push(angle(d));
                    });
                });
                pieLabels.each(function (d, i) {
                    const group = d3.select(this);
                    $(group[0][0]).find('text').attr('transform', 'rotate(' + angleArray[i] + ')');
                });
            }
        }

        // prepare text style props object and set
        _.forEach(styleProps, (value, key) => {
            if (key === 'fontsize' || key === 'fontunit') {
                styleObj[value] = this.fontsize + this.fontunit;
            } else {
                styleObj[value] = this[key];
            }
        });
        setTextStyle(styleObj, this.$id);

        /*
         * allow window-resize functionality, for only-run mode as
         * updating chart is being handled by watchers of height & width in studio-mode
         * */
        triggerFn(this._resizeFn && this._resizeFn.clear);
        this._resizeFn = nv.utils.windowResize(() => {
            if (element[0].getBoundingClientRect().height) {
                chart.update();
                postPlotChartProcess(this);
                if (!isPieType(this.type)) {
                    this.setLabelsMaxWidth();
                }
            } else {
                // TODO: get parents of accordion type
                /*let parent = element.closest('.app-accordion-panel, .tab-pane').isolateScope();
                if (parent) {
                    parent.initialized = false;
                }*/
            }
        });
    }

    // prepares and configures the chart properties
    configureChart() {
        // Copy the data only in case of pie chart with default data
        // Reason : when multiple pie charts are bound to same data, first chart theme will be applied to all charts
        let xDomainValues;
        let yDomainValues;
        let chart;
        let beforeRenderVal;
        const yformatOptions: any = {};

        if (this._processedData.length > 0) {
            if (isAxisDomainValid(this, 'x')) {
                xDomainValues = this.binddataset ? this.getXMinMaxValues(this._processedData[0]) : { 'min' : {'x': 1},  'max' : {'x' : 5}};
            }
            if (isAxisDomainValid(this, 'y')) {
                yDomainValues = this.binddataset ? this.getYMinMaxValues(this._processedData) : { 'min' : {'y' : 1}, 'max' : {'y' : 5}};
            }
        }

        if (isPieType(this.type) && (!this.binddataset || !this.scopedataset)) {
            this._processedData = getClonedObject(this.scopedataset || this._processedData);
        }

        // get the chart object
        chart = initChart(this, xDomainValues, yDomainValues, null, !this.binddataset);

        if (_.isArray(this._processedData)) {
            // WMS-19499:  To remove chart X-axis old ticks when chart data loaded dynamically.
            const oldgTicks =  $('#wmChart' + this.$id + ' svg').find('g.nv-x').find('g.tick');
            if (oldgTicks && oldgTicks.length) {
                oldgTicks.remove();
            }
            beforeRenderVal = this.invokeEventCallback('beforerender', { 'chartInstance' : chart});
            if (beforeRenderVal) {
                chart = beforeRenderVal;
            }
            this.chart = chart;
            // changing the default no data message
            d3.select('#wmChart' + this.$id + ' svg')
                .datum(this._processedData)
                .call(this.chart);
            this.postPlotProcess(chart);
            return chart;
        }
    }

    // Plotting the chart with set of the properties set to it
    plotChart() {
        const element = this.$element;
        // call user-transformed function
        this.chartData = (this.invokeEventCallback('transform')) || this.chartData;

        // Getting the order by data only in run mode. The order by applies for all the charts other than pie and donut charts
        if (this.isVisuallyGrouped && !isPieType(this.type)) {
            this._processedData = this.chartData;
        } else {
            this._processedData = this.processChartData();
        }
        // checking the parent container before plotting the chart
        if (!element[0].getBoundingClientRect().height) {
            return;
        }
        if (this.clearCanvas) {
            // empty svg to add-new chart
            element.find('svg').replaceWith('<svg></svg>');
            this.clearCanvas = false;
        }

        // In case of invalid axis show no data available message
        if (!this.isValidAxis()) {
            this._processedData = [];
        }
        nv.addGraph(() => this.configureChart(),  () => {
            /*Bubble chart has an time out delay of 300ms in their implementation due to which we
            * won't be getting required data points on attaching events
            * hence delaying it 600ms*/
            setTimeout( () => {
                this.attachClickEvent();
            }, 600);
        });
        this.isLoadInProgress = false;
    }
    // TODO: Need way to figure out if the datasource is a live source
    get isLiveVariable() {
        // setting the flag for the live variable in the scope for the checks
        const variableObj = this.datasource;
        return variableObj && variableObj.category === 'wm.LiveVariable';
    }

    plotChartProxy() {
        this.showContentLoadError = false;
        this.invalidConfig = false;
        // Checking if x and y axis are chosen
        this.isLoadInProgress = true;
        const groupingDetails = this.getGroupingDetails();
        // If aggregation/group by/order by properties have been set, then get the aggregated data and plot the result in the chart.
        // TODO: datasource for live variable detection
        if (this.binddataset && this.isLiveVariable && (this.filterFields || this.isDataFilteringEnabled())) {
            this.getAggregatedData(() => this.plotChart());
        } else { // Else, simply plot the chart.
            // In case of live variable resetting the aggregated data to the normal dataset when the aggregation has been removed
            if (this.dataset && this.isLiveVariable) {
                this.chartData = this.dataset;
                if (this.isGroupByEnabled() && groupingDetails.isVisuallyGrouped) {
                    this.chartData = this.getVisuallyGroupedData(this.chartData, groupingDetails.visualGroupingColumn);
                }

            }
            this.plotChart();
        }
    }

    // sets the default x and y axis options
    setDefaultAxisOptions() {
        const defaultColumns = this.getDefaultColumns();
        // If we get the valid default columns then assign them as the x and y axis
        // In case of service variable we may not get the valid columns because we cannot know the datatypes
        this.xaxisdatakey = defaultColumns[0] || null;
        this.yaxisdatakey = defaultColumns[1] || null;
    }

    getCutomizedOptions(prop, fields) {
        const groupByColumns = _.split(this.groupby, ','),
            aggColumns = _.split(this.aggregationcolumn, ',');
        if (!this.binddataset) {
            return fields;
        }
        if (!this.axisoptions) {
            this.axisoptions = fields;
        }
        let newOptions;
        switch (prop) {
            case 'xaxisdatakey':
                // If group by enabled, columns chosen in groupby will be populated in x axis options
                if (this.isGroupByEnabled()) {
                    newOptions = groupByColumns;
                }
                break;
            case 'yaxisdatakey':
                // If aggregation by enabled, columns chosen in aggregation will be populated in y axis options
                if (this.isAggregationEnabled()) {
                    newOptions = aggColumns;
                } else if (this.isLiveVariable) {
                    // In case of live variable populating only numeric columns
                    newOptions = this.numericColumns;
                }
                break;
            case 'groupby':
                // Filtering only non primary key columns
                if (this.isLiveVariable && this.nonPrimaryColumns && this.nonPrimaryColumns.length) {
                    newOptions = this.nonPrimaryColumns;
                }
                break;
            case 'aggregationcolumn':
                // Set the 'aggregationColumn' to show all keys in case of aggregation function is count or to numeric keys in all other cases.
                if (this.isLiveVariable && this.isAggregationEnabled() && this.aggregation !== 'count') {
                    newOptions = this.numericColumns;
                }
                break;
            case 'orderby':
                // Set the 'aggregationColumn' to show all keys in case of aggregation function is count or to numeric keys in all other cases.
                if (this.isLiveVariable && this.isAggregationEnabled()) {
                    newOptions = _.uniq(_.concat(groupByColumns, aggColumns));
                }
                break;
            case 'bubblesize':
                if (this.numericColumns && this.numericColumns.length) {
                    newOptions = this.numericColumns;
                }
                break;
        }

        return newOptions || fields || this.axisoptions;
    }

    // Function that iterates through all the columns and then fetching the numeric and non primary columns among them
    setNumericandNonPrimaryColumns() {
        let columns,
            type;
        const propertiesMap = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP);
        this.numericColumns = [];
        this.nonPrimaryColumns = [];
        // Fetching all the columns
        if (this.dataset && !_.isEmpty(propertiesMap)) {
            columns = []; // TODO: fetchPropertiesMapColumns(propertiesMap);
        }

        if (columns) {
            // Iterating through all the columns and fetching the numeric and non primary key columns
            _.forEach(Object.keys(columns), (key) => {
                type = columns[key].type;
                if (isNumberType(type)) {
                    this.numericColumns.push(key);
                }
                // Hiding only table's primary key
                if (columns[key].isRelatedPk === 'true' || !columns[key].isPrimaryKey) {
                    this.nonPrimaryColumns.push(key);
                }
            });
            this.numericColumns = this.numericColumns.sort();
            this.nonPrimaryColumns = this.nonPrimaryColumns.sort();
        }
    }

    // plot the chart
    handleDataSet(newVal) {
        this.errMsg = '';
        // Resetting the flag to false when the binding was removed
        if (!newVal && !this.binddataset) {
            this.isVisuallyGrouped = false;
            this.axisoptions = null;
        }

        // liveVariables contain data in 'data' property' of the variable
        this.chartData = this.isLiveVariable ? newVal || '' : (newVal && newVal.dataValue === '' && _.keys(newVal).length === 1) ? '' : newVal;

        // if the data returned is an object make it an array of object
        if (!_.isArray(this.chartData) && _.isObject(this.chartData)) {
            this.chartData = [this.chartData];
        }

        if (newVal && newVal.filterFields) {
            this.filterFields = newVal.filterFields;
        }

        // plotchart for only valid data and only after bound variable returns data
        if (this.chartData) {
            this._plotChartProxy();
        }
    }

    _plotChartProxy = _.debounce(this.plotChartProxy.bind(this), 100);

    onPropertyChange(key, newVal, oldVal?) {
        super.onPropertyChange(key, newVal, oldVal);
        switch (key) {
            case 'dataset':
                this.handleDataSet(newVal);
                break;
            case 'type':
                // Based on the change in type deciding the default margins
                if (isPieType(this.type)) {
                    this.offsettop = 20;
                    this.offsetright = 0;
                    this.offsetbottom = 0;
                    this.offsetleft = 0;
                } else if (oldVal === 'Pie' || oldVal === 'Donut') {
                    this.offsettop = 25;
                    this.offsetright = 25;
                    this.offsetbottom = 55;
                    this.offsetleft = 75;
                }

                if (oldVal !== newVal) {
                    this.clearCanvas = true;
                }
                // In studio mode, configure properties dependent on chart type
                this._plotChartProxy();
                break;
            default:
                // In RunMode, the plotchart method will not be called for all property change
                this._plotChartProxy();
                break;
        }
        if (_.includes(advanceDataProps, key)) {
            this._plotChartProxy();
        }
    }

    handleLoading(data) {
        const dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.variableInflight = data.active;
            this.isLoadInProgress = data.active;
        }
    }

    onStyleChange(key, newVal, oldVal) {
        const styleObj = {};
        super.onStyleChange(key, newVal, oldVal);
        switch (key) {
            case 'fontsize':
            case 'fontunit':
            case 'color':
            case 'fontfamily':
            case 'fontweight':
            case 'fontstyle':
            case 'textdecoration':
                styleObj[styleProps[key]] = (key === 'fontsize' || key === 'fontunit') ? this.fontsize + this.fontunit : newVal;
                setTextStyle(styleObj, this.$id);
                break;
        }
    }

    constructor(inj: Injector, private app: App) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['fontsize', 'fontunit', 'color', 'fontfamily', 'fontweight', 'fontstyle', 'textdecoration']);

        // generate unique id for the component
        this.$id = this.widgetId || Math.random();
        // remove title attribute as the element on hover shows you the hint through-out the element
        removeAttr(this.nativeElement, 'title');
        this.chartReady = false;
        this.binddataset = this.nativeElement.getAttribute('dataset.bind');
        // Show loading status based on the variable life cycle
        this._subsciptions.push(this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this)));
        // Will hide tolltip of a chart in mobile when the user scrolls.
        this._subsciptions.push(this.app.subscribe('iscroll-start', () => { d3.selectAll('.nvtooltip').style('opacity', 0);}));
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        // For old projects
        if (!_.includes(['outside', 'inside', 'hide'], this.showlabels)) {
            this.showlabels        = getBooleanValue(this.showlabels);
            this.showlabelsoutside = getBooleanValue(this.showlabelsoutside);
            this.showlabels        = this.showlabels ? (this.showlabelsoutside ? 'outside' : 'inside') : 'hide';
        }

        if (!this.theme) {
            // Default theme for pie/donut is Azure and for other it is Terrestrial
            this.theme = isPieType(this.type) ? 'Azure' : 'Terrestrial';
        }

        this.nativeElement.setAttribute('id', 'wmChart' + this.$id);
        // When there is not value binding, then plot the chart with sample data
        if (!this.binddataset && !this.nativeElement.getAttribute('scopedataset')) {
            this._plotChartProxy();
        }
    }

    ngOnDestroy() {
        // destroy all subscriptions to prevent memory leak.
        this._subsciptions.forEach((subscription)=>{
            subscription();
        });
        super.ngOnDestroy();
    }
    redraw = this._plotChartProxy.bind(this);
}
