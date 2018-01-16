import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-html-demo',
  templateUrl: './html-demo.component.html',
  styleUrls: ['./html-demo.component.less']
})
export class HtmlDemoComponent implements OnInit {

    fontsize: number = 30;

    fontunit: string= 'px';

    hint: string = 'This is a html container';

    width: string = '200px';

    height: string = '200px';

    fontfamily: string = '200px';

    color: string = '#000000';

    fontstyle: string = 'italic';

    fontweight: string = 'bold';

    textalign: string;

    backgroundcolor: string = '#ffffff';

    backgroundrepeat: string;

    backgroundposition: string;

    backgroundsize: string;

    backgroundattachment: string;

    bordercolor: string;

    backgroundimage: string;

    borderstyle: string;

    borderwidth: string;

    padding: string;

    margin: string;

    constructor() { }

    ngOnInit() {
    }

}
