import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-nav-demo',
    templateUrl: './nav-demo.component.html'
})
export class NavDemoComponent implements OnInit {

    _navDataset = [
        {
            'label': 'Home',
            'icon': 'wi wi-home',
            'link': '#/home',
            'action': 'Widgets.empForm.save()'
        },
        {
            'label': 'Dashboard',
            'children': [
                {
                    'label': 'Action',
                    'icon': 'wi wi-book'
                },
                {
                    'label': 'Help',
                    'icon': 'wi wi-question-sign'
                }
            ]
        },
        {
            'label': 'Others',
            'icon': 'wi wi-shopping-cart',
            'link': 'http://www.example.com',
            'action': 'Widgets.empForm.new()'
        },
        {
            'label': 'Inventory',
            'icon': 'wi wi-tags',
            'action': 'Widgets.empForm.reset()'
        }
    ];

    constructor() { }

    ngOnInit() { }

}
