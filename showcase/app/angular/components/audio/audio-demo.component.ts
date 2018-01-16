import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-demo',
  templateUrl: './audio-demo.component.html',
  styleUrls: ['./audio-demo.component.less']
})
export class AudioDemoComponent implements OnInit {

  muted: boolean = false;
  loop: boolean = false;
  mp3format: string = 'https://www.w3schools.com/html/horse.mp3';
  controls: boolean = true;

  constructor() { }

  ngOnInit() { }

}
