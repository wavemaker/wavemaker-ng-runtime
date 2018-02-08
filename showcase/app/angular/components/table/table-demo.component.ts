import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-table-demo',
    templateUrl: './table-demo.component.html',
    styleUrls: ['./table-demo.component.less'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class TableDemoComponent implements OnInit {

    myTableWidget;
    _title = 'Table';
    _subheading = 'Employee Details';
    _iconclass = 'glyphicon glyphicon-equalizer';
    _showheader = true;
    _enablesort = true;
    _enablecolumnselection = false;
    _gridfirstrowselect = true;
    navAligns = ['left', 'center', 'right'];
    _navigationalign = this.navAligns[0];
    _dataset = [
        {
            'userId': 1,
            'username': 'admin',
            'password': 'admin',
            'role': 'adminrole',
            'tenantId': 1
        },
        {
            'userId': 2,
            'username': 'user',
            'password': 'user',
            'role': 'userrole',
            'tenantId': 1
        },
        {
            'userId': 3,
            'username': 'admin2',
            'password': 'admin2',
            'role': 'adminrole',
            'tenantId': 2
        },
        {
            'userId': 4,
            'username': 'user2',
            'password': 'user2',
            'role': 'userrole',
            'tenantId': 2
        },
        {
            'userId': 5,
            'username': 'anon',
            'password': 'anon',
            'role': 'anonymous',
            'tenantId': 1
        },
        {
            'userId': 6,
            'username': 'admin',
            'password': 'admin',
            'role': 'adminrole',
            'tenantId': 1
        },
        {
            'userId': 7,
            'username': 'user',
            'password': 'user',
            'role': 'userrole',
            'tenantId': 1
        },
        {
            'userId': 8,
            'username': 'admin2',
            'password': 'admin2',
            'role': 'adminrole',
            'tenantId': 2
        },
        {
            'userId': 9,
            'username': 'user2',
            'password': 'user2',
            'role': 'userrole',
            'tenantId': 2
        },
        {
            'userId': 10,
            'username': 'anon',
            'password': 'anon',
            'role': 'anonymous',
            'tenantId': 1
        }
    ];

    ngOnInit() {
    }

    constructor() {
        this.myTableWidget = (<any>window).widgetRegistryByName.get('myTable');
    }

    onActionClick() {
        alert('click');
    }
}
