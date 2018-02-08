import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector:   'app-pagination-demo',
    templateUrl:   './pagination-demo.component.html',
    styleUrls:   ['./pagination-demo.component.less'],
    changeDetection:   ChangeDetectionStrategy.Default
})
export class PaginationDemoComponent implements OnInit {
    myPaginationWidget;
    public navigationtypes = ['Basic', 'Pager', 'Classic'];
    public navigationtype = 'Pager';

    public navigationAlignOptions = ['left', 'center', 'right'];
    public _navigationalign = 'left';

    public navigationSizeOptions = ['small', 'large'];
    public _navigationsize = 'small';

    public _maxResults = 2;

    public _data = [
        {
            'empId':  1,
            'firstname':  'Eric'
        },
        {
            'empId':  2,
            'firstname':  'Brad'
        },
        {
            'empId':  3,
            'firstname':  'Chris'
        },
        {
            'empId':  4,
            'firstname':  'Amanda'
        },
        {
            'empId':  5,
            'firstname':  'Jane'
        },

        {
            'empId': 6,
            'firstname': 'Jessica'
        },
        {
            'empId': 7,
            'firstname': 'Keith'
        },
        {
            'empId': 8,
            'firstname': 'William'
        },
        {
            'empId': 9,
            'firstname': 'Sally'
        },
        {
            'empId': 10,
            'firstname': 'Patricia'
        }

    ];
    ngOnInit() {
        this.myPaginationWidget = (<any>window).widgetRegistryByName.get('myPagination');
    }

    constructor() {
    }


}
