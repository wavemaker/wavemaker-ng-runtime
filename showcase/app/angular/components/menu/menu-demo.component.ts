import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-menu-demo',
    templateUrl: './menu-demo.component.html',
    styleUrls: ['./menu-demo.component.less']
})
export class MenuDemoComponent implements OnInit {

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

    widgets: any = [
        {
            label: 'Basic',
            children: [
                {
                    label: 'Anchor',
                    link: '#/anchor'
                },
                {
                    label: 'Icon',
                    link: '#/icon'
                },
                {
                    label: 'Label',
                    link: '#/label'
                },
                {
                    label: 'Picture',
                    link: '#/picture'
                },
                {
                    label: 'Message',
                    link: '#/message'
                }
            ]
        },
        {
            label: 'Input',
            children: [
                {
                    label: 'Button',
                    link: '#/button'
                },
                {
                    label: 'Audio',
                    link: '#/audio'
                },
                {
                    label: 'Video',
                    link: '#/video'
                },
                {
                    label: 'Button group',
                    link: '#/buttongroup'
                },
                {
                    label: 'Date',
                    link: '#/date'
                }
            ]
        },
        {
            label: 'Layouts',
            children: [
                {
                    label: 'Tabs',
                    link: '#/tabs'
                },
                {
                    label: 'Panel',
                    link: '#/panel'
                },
                {
                    label: 'Layout grid',
                    link: '#/layoutgrid'
                }
            ]
        }
    ];

    caption: string = 'Menu';

    width: string = '100px';

    height: string;

    iconclass: string;

    layout: string;

    layouts: string[] = ['vertical', 'horizontal'];

    position: string = 'down,right';

    positions: string[] = ['up,left', 'up,right', 'down,left', 'down,right', 'inline'];

    target: string;

    targets: string[] = ['_blank', '_parent', '_self', '_top'];

    tabindex: number = 0;

    constructor() { }

    ngOnInit() {
    }

}
