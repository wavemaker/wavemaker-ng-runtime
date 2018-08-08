import { Input } from '@angular/core';

/**
 * The wmChart component defines the chart widget.
 */
export class Chart {
    /**
     * Title for the chart widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * The type of the chart. <br>
     */
    @Input() type: string;
    /**
     * Subheading for the chart widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;
    /**
     * Name of the chart widget.
     */
    @Input() name: string;
    /**
     * This property defines the value of the chart widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property shows the options to group the data.
     */
    @Input() groupby: string;
    /**
     * This property shows the different options available to aggregate the data in the chart.
     */
    @Input() aggregation: string;
    /**
     * This property shows the columns using which you can aggregate the data in the chart.
     */
    @Input() aggregationcolumn: string;
    /**
     * This property shows the options to order the data.
     */
    @Input() orderby: string;
    /**
     * This property defines the key of the object, i.e y-axis variable, on the chart.
     */
    @Input() xaxisdatakey: string;
    /**
     * This property defines the caption of x axis on the chart.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() xaxislabel: string;
    /**
     * This property shows the options to format the number type in x axis.
     */
    @Input() xnumberformat: string;
    /**
     * This property defines the number of digits to be displayed after decimal in x axis.
     */
    @Input() xdigits: number;
    /**
     * This property shows the options to format the date type in x axis.
     */
    @Input() xdateformat: string;
    /**
     * This property controls the distance between the x axis and its label.
     */
    @Input() xaxislabeldistance: number;
    /**
     * This property defines the number of digits to be displayed after decimal in x axis.
     */
    @Input() xunits: number;
    /**
     * This property specifies the units for the y axis.
     */
    @Input() yaxisdatakey: string;
    /**
     * This property defines the caption of y axis on the chart.
     */
    @Input() yaxislabel: string;
    /**
     * This property shows the options to format the number type in y axis.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() ynumberformat: string;
    /**
     * This property shows the number of digits to be displayed after decimal in y axis.
     */
    @Input() ydigits: number;
    /**
     * This property controls the distance between the y axis and its label.
     */
    @Input() yaxislabeldistance: number;
    /**
     * This property specifies the units for the y axis.
     */
    @Input() yunits: number;
    /**
     * This property will be used to show/hide the chart widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * This property shows the message which will be displayed in grid, when there is no data to display.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodatamessage: string = 'No Data Available.';
    /**
     * This property shows the message which will be displayed in grid, when the data is loading.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() loadingdatamsg: string = 'Loading...';
    /**
     * This property controls whether to show the tooltip on hover.
     */
    @Input() tooltips: boolean = true;
    /**
     * This property controls where to show the legends.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'hide', 'top', 'bottom' </code></p>
     */
    @Input() showlegend: string = 'top';
    /**
     * This property controls the visibility of labels.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'hide', 'outside', 'inside' </code></p>
     */
    @Input() showlabels: string = 'outside';
    /**
     * This property controls showing of values on the bars.
     */
    @Input() showvalues: boolean = false;
    /**
     * This property controls whether to stagger the labels which distributes labels into multiple lines.
     */
    @Input() staggerlabels: boolean = false;
    /**
     * This property controls whether to reduce the xticks or not.
     */
    @Input() reducexticks: boolean = true;
    /**
     * This property controls the type of the label to be shown in the chart.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'key', 'value', 'percent', 'key, value' </code></p>
     */
    @Input() labeltype: string = 'percent';
    /**
     * This property controls the spacing between the bars.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'small', 'medium', 'large' </code></p>
     */
    @Input() barspacing: string = 'medium';
    /**
     * This property controls the radius of a Donut chart.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'small', 'medium', 'large' </code></p>
     */
    @Input() donutratio: string = 'medium';
    /**
     * This property controls the size of the bubble for a Bubble chart.
     */
    @Input() bubblesize: string;
    /**
     * This property enables showing the distance from the x axis.
     */
    @Input() showxdistance: boolean = false;
    /**
     * This property enables showing the distance from the y axis.
     */
    @Input() showydistance: boolean = false;
    /**
     * This property controls how to show area in an Area chart.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'stack', 'stream', 'expand' </code></p>
     */
    @Input() areaviewtype: string = 'stack';
    /**
     * This property determines how datapoints are joined and rendered in chart
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'linear', 'cardinal', 'step' </code></p>
     */
    @Input() interpolation: string = 'linear';
    /**
     * This property determines the text to include in the centre of a donut chart
     */
    @Input() centerlabel: string;
    /**
     * This property enables to define custom colors to chart.
     */
    @Input() customcolors: string;
    /**
     * This property controls theme of chart.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'Terrestrial', 'Annabelle', 'Azure', 'Retro', 'Mellow', 'Orient', 'GrayScale', 'Flyer', 'Luminosity'</code></p>
     */
    @Input() theme: string;
    /**
     * This property controls the offset(left, right, top, bottom) of the chart.
     */
    @Input() offset: number;
    /**
     * This property decides whether to show x axis or not.
     */
    @Input() showxaxis: boolean = true;
    /**
     * This property decides whether to show y axis or not.
     */
    @Input() showyaxis: boolean = true;
    /**
     * This property controls thickness of line in line and cumulative line chart.
     */
    @Input() linethickness: string;
    /**
     * This property decides whether to highlight points or not.
     */
    @Input() highlightpoints: boolean = false;
    /**
     * This property shows the options to format the number type.
     */
    @Input() formattype: string;

    /**
     * Callback function which will be triggered when the chart is selected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chart widget
     * @param selectedItem The data of selected item from data source
     * @param selectedChartItem The data of selected item on chart
     */
    onSelect($event: MouseEvent, widget: any, selectedItem: any, selectedChartItem: any) {}
    /**
     * Callback function which will be triggered for transform event.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chart widget
     */
    onTransform($event: MouseEvent, widget: any) {}
}