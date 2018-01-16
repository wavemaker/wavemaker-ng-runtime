import { Component } from '@angular/core';

@Component({
    selector: 'app-spinner-demo',
    templateUrl: './spinner-demo.component.html'
})
export class SpinnerDemoComponent {

    types: string[] = ['icon', 'image'];

    spinnerType: string = 'icon';

    animationTypes = [' ', 'bounce', 'fadeIn', 'fadeOut', 'flash', 'flipInX', 'flipInY', 'pulse', 'shake', 'spin', 'swing', 'tada', 'wobble', 'zoomIn', 'zoomOut'];

    animation: string= 'fadeIn';

    iconClass: string= 'fa fa-book';

    iconSize: string = '2em';

    messageContent: string= 'Loading';

    imageURL: string = 'https://apionline.sodapdf.com/Public/widgets/convertmyimage/download/1897921.jpg';

    imageWidth: string = '25px';

    imageHeight: string = '25px';

    constructor() { }
}
