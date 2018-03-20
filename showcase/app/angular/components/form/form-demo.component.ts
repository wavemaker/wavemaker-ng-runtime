import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HtmlParser } from '@angular/compiler';

@Component({
    selector: 'app-form-demo',
    templateUrl: './form-demo.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class FormDemoComponent implements OnInit {

    @ViewChild('form_1') public _Form;
    _displayname = 'Username';
    isUpdateMode = true;
    _hint = 'Please enter value';
    _validationmessage = 'This is required field';
    b;
    _required = true;
    _title = 'Form';
    _subheading = 'Employee Details';
    _iconclass = 'glyphicon glyphicon-edit';

    captionAlignOptions = ['left', 'center', 'right'];
    captionPositionOptions = ['left', 'right', 'top'];
    _captionalign = this.captionAlignOptions[0];
    _captionposition = this.captionPositionOptions[2];
    _captionwidth = 'xs-12 sm-3 md-3 lg-3';

    validationoptions = ['default', 'html', 'none'];
    _validationtype = this.validationoptions[0];

    options: any[] = ['admin', 'user', 'guest'];


    keys: string[] = Object.keys(this.options[0]);
    dataFieldKeys: string[] = this.keys.concat(['All Fields']);

    datafield: string = this.keys[0];

    displayfield: string = this.keys[0];

    ngOnInit() {
    }

    setData() {
        this._Form._ngForm.setValue({
            'username': 'abhi',
            'password': 'abhi',
            'role': 'admin',
            'rating': 2
        });
    }

    constructor() {
    }
}
