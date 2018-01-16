import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-label-demo',
  templateUrl: './label-demo.component.html',
  styleUrls: ['./label-demo.component.less']
})
export class LabelDemoComponent implements OnInit {

  caption: string = 'Label';
  class: string = 'text-danger';
  width: string = '300px';
  height: string = '10px';

  constructor() { }

  ngOnInit() {}

}
