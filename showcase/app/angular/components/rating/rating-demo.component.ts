import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-rating-demo',
  templateUrl: './rating-demo.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RatingDemoComponent implements OnInit {


  width: string = '';

  maxvalue: number = 5;

  datavalue: any = 2;

  iconsize: string = '40px';

  iconcolor: string = '#df3f3f';

  datafield: string = 'datafield';

  displayfield: string = 'name';

  dataset: any[] = [{
      name: 'Eric',
      company : 'X',
      datafield: 1
    },
    {
      name: 'Bob',
      company : 'Y',
      datafield: 2
    },
    {
      name: 'Stella',
      company : 'Z',
      datafield: 3
    }];
  showcaptions: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
