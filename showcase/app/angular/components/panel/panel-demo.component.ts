import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-panel-demo',
    templateUrl: './panel-demo.component.html',
    styleUrls: ['./panel-demo.component.less']
})
export class PanelDemoComponent implements OnInit {

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

    title: string = 'Title';

    subheading: string = 'Subheading';

    iconclass: string = 'wi wi-account-circle';

    collapsible: boolean = false;

    enablefullscreen: boolean = false;

    closable: boolean = false;

    expanded: boolean = true;

    constructor() { }

    ngOnInit() { }

    panelClosed(data) {
        console.log(data);
    }

}
