import { Component } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-lottieloder',
  imports: [LottieComponent],
  templateUrl: './lottieloder.component.html',
  styleUrl: './lottieloder.component.css'
})
export class LottieloderComponent {
  options: AnimationOptions = {
    path: '../assets/animation.json',
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

}
