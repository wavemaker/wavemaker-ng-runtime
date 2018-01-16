import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {


    nodes: any = [
        {
            label: 'item1',
            icon: 'wi wi-euro-symbol',
            children: [
                {
                    label: 'sub-menu-item1',
                    icon: 'wi wi-euro-symbol'
                },
                {
                    label: 'sub-menu-item2',
                    icon: 'wi wi-euro-symbol',
                    children: [
                        {
                            label: 'sub-menu-child-item1',
                            icon: 'wi wi-euro-symbol'
                        },
                        {
                            label: 'sub-menu-child-item2',
                            icon: 'wi wi-euro-symbol'
                        }
                    ]
                }
            ]
        },
        {
            label: 'item2',
            icon: 'wi wi-euro-symbol',
            action: 'Widgets.empForm.save()'
        },
        {
            label: 'item3',
            icon: 'wi wi-euro-symbol',
            action: 'Widgets.empForm.new()'
        },
        {
            label: 'item4',
            icon: 'wi wi-euro-symbol',
            action: 'Widgets.empForm.reset()'
        }
    ];

    constructor() { }

    ngOnInit() { }

}
