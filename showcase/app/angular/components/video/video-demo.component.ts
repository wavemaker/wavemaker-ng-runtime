import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-demo',
  templateUrl: './video-demo.component.html',
  styleUrls: ['./video-demo.component.less']
})
export class VideoDemoComponent implements OnInit {
    muted: boolean  = false;
    autoplay: boolean = false;
    videopreload: string = 'metadata';
    controls: boolean = true;
    loop: boolean = false;
    postersource: string = 'https://upload.wikimedia.org/wikipedia/en/e/e5/Source_Code_Poster.jpg';
    mp4videoUrl: string = 'https://www.w3schools.com/html/mov_bbb.mp4';

  constructor() { }

  ngOnInit() {
  }

}
