import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-list-demo',
    templateUrl: './list-demo.component.html'
})
export class ListDemoComponent implements OnInit {

    tabindex: number = 0;

    paginationList: Array<string> = ['Advanced', 'Basic', 'Classic', 'None', 'Pager'];

    naviagtionType: string = 'Basic';

    dataset: object = {
        'data': [
            {
                'empId': 1,
                'firstname': 'Eric',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Eric-Lin.png',
                'lastname': 'Lin'
            },
            {
                'empId': 2,
                'firstname': 'Brad',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Brad-Tucker.png',
                'lastname': 'Tucker'
            },
            {
                'empId': 3,
                'firstname': 'Chris',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Chris-Madison.png',
                'lastname': 'Madison'
            },
            {
                'empId': 4,
                'firstname': 'Amanda',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Amanda-Brown.png',
                'lastname': 'Brown'
            },
            {
                'empId': 5,
                'firstname': 'Jane',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Jane-Lisa.png',
                'lastname': 'Lisa'
            },
            {
                'empId': 6,
                'firstname': 'Jessica',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Jessica-Bennet.png',
                'lastname': 'Bennet'
            },
            {
                'empId': 7,
                'firstname': 'Keith',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Keith-Neilson.png',
                'lastname': 'Neilson'
            },
            {
                'empId': 8,
                'firstname': 'William',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/William-Hogan.png',
                'lastname': 'Hogan'
            },
            {
                'empId': 9,
                'firstname': 'Sally',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Sally-Jones.png',
                'lastname': 'Jones'
            },
            {
                'empId': 10,
                'firstname': 'Patricia',
                'picurl': 'http://www.wavemaker.com/examples/salesrep/Patricia-George.png',
                'lastname': 'George'
            }
        ]
    };

    constructor() { }

    ngOnInit() {
    }

}
