import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { App, AbstractI18nService, setPipeProvider} from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { NumberComponent } from './number.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, registerLocaleData } from '@angular/common';
import { PipeProvider } from '../../../../../../runtime-base/src/services/pipe-provider.service';
import localePT from '@angular/common/locales/pt.js';


let mockApp =  {};

class mockAbstractI18nService {
    public getSelectedLocale() {
       return 'en';
    }
};
class mockAbstractI18nServicePt {
    public getSelectedLocale() {
        return 'pt';
    }
};

@Component({
    template: `<div wmNumber textalign="right" name="testnumber" ngModel></div>`
})

class NumberWrapperComponent {
    @ViewChild(NumberComponent)
    numberComponent: NumberComponent;
    public testDefaultValue = 123.4;
    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

describe('NumberComponent', () => {
    let wrapperComponent: NumberWrapperComponent;
    let numberComponent: NumberComponent;
    let fixture: ComponentFixture<NumberWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule
            ],
            declarations: [NumberWrapperComponent, NumberComponent],
            providers: [
                {provide: App, useValue: mockApp},
                {provide: AbstractI18nService, useClass: mockAbstractI18nService},
                {provide: DecimalPipe, useClass: DecimalPipe}
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(NumberWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        numberComponent = wrapperComponent.numberComponent;
        fixture.detectChanges();
    }));

    it('should create the Number Component', () => {
        expect(wrapperComponent).toBeTruthy() ;
    });

    it('should display the default value in english language', () => {
        numberComponent.datavalue = wrapperComponent.testDefaultValue;
        fixture.detectChanges();
        // check for the number display value
        expect((numberComponent as any).transformNumber(numberComponent.datavalue)).toEqual(fixture.debugElement.nativeElement.querySelector('input').value);
    });

});
describe('NumberComponent with Localization',()=>{
    let wrapperComponent: NumberWrapperComponent;
    let numberComponent: NumberComponent;
    let fixture: ComponentFixture<NumberWrapperComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule
            ],
            declarations: [NumberWrapperComponent, NumberComponent],
            providers: [
                {provide: App, useValue: mockApp},
                {provide: AbstractI18nService, useClass: mockAbstractI18nServicePt},
                {provide: DecimalPipe, useClass: DecimalPipe}
            ]
        })
            .compileComponents();
        // register the selected locale language
        registerLocaleData(localePT);
        fixture = TestBed.createComponent(NumberWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        numberComponent = wrapperComponent.numberComponent;
        fixture.detectChanges();
    }));

    it('should create the Number Component', () => {
        expect(wrapperComponent).toBeTruthy() ;
    });

    it('should display the default value in portugues language', () => {
        numberComponent.datavalue = wrapperComponent.testDefaultValue;
        fixture.detectChanges();
        // check for the number display value(In portugues language the default value 123.4 should display as 123,4)
        expect((numberComponent as any).transformNumber(numberComponent.datavalue)).toEqual(fixture.debugElement.nativeElement.querySelector('input').value);
    });

});
