import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-picture-demo',
  templateUrl: './picture-demo.component.html',
  styleUrls: ['./picture-demo.component.less']
})
export class PictureDemoComponent implements OnInit {

  picturesource: string = 'https://angular.io/assets/images/logos/angular/angular.svg';
  pictureaspect: string = 'H';
  encodeurl: boolean = false;
  hint: string = 'Angular!';
  shape: string = 'thumbnail';
  width: string = '100px';
  height: string = '100px';

  constructor() { }

  ngOnInit() {
  }

}
