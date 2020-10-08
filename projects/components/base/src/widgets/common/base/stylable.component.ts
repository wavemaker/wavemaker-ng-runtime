import { setCSS } from '@wm/core';
import { BaseComponent } from './base.component';

export abstract class StylableComponent extends BaseComponent {
    backgroundattachment: string;
    backgroundcolor: string;
    backgroundgradient: string;
    backgroundimage: string;
    backgroundposition: string;
    backgroundrepeat: string;
    backgroundsize: string;
    bordercolor: string;
    borderradius: string;
    borderstyle: string;
    borderwidth: string;
    borderbottomwidth: string;
    borderleftwidth: string;
    borderrightwidth: string;
    bordertopwidth: string;
    color: string;
    cursor: string;
    display: string;
    fontsize: string;
    fontfamily: string;
    fontstyle: string;
    fontunit: string;
    fontvariant: string;
    fontweight: string;
    height: string;
    horizontalalign: string;
    lineheight: string;
    margin: string;
    marginbottom: string;
    marginleft: string;
    marginright: string;
    margintop: string;
    opacity: string;
    overflow: string;
    padding: string;
    paddingbottom: string;
    paddingleft: string;
    paddingright: string;
    paddingtop: string;
    picturesource: string;
    textalign: string;
    textdecoration: string;
    verticalalign: string;
    visibility: string;
    whitespace: string;
    width: string;
    wordbreak: string;
    zindex: string;

   public setHeightWidthForElement(ele:any, height?:string, width?:string){
        if(!ele){
            return;
        }
        if(height){
            setCSS(ele, 'height', height);
        }

        if(width){
            setCSS(ele, 'width', width);
        }
    }

}
