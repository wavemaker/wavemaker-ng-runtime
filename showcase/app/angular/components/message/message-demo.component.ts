import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-demo',
  templateUrl: './message-demo.component.html',
  styleUrls: ['./message-demo.component.less']
})
export class MessageDemoComponent implements OnInit {
    caption: string = 'Hello World!';

    type: string = 'success';

    constructor() { }

    ngOnInit() {
    }

}
