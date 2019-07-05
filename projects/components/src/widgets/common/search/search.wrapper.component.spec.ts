import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ImagePipe } from '../../../pipes/image.pipe';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import {App} from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap';
import { By } from '@angular/platform-browser';

let mockApp = {};

@Component({
    template: `
        <div wmSearch name="testsearch"
                searchon="typing"
                change.event="onChange($event, widget, newVal, oldVal)"
        ></div>
    `
})
class SearchWrapperComponent {
    @ViewChild(SearchComponent)
    searchComponent: SearchComponent;

    public onChange($event, widget, newVal, oldVal) {
        console.log('Searching...');
    }
}

describe('SearchComponent', () => {
   let wrapperComponent: SearchWrapperComponent;
   let searchComponent: SearchComponent;
   let fixture: ComponentFixture<SearchWrapperComponent>;

   beforeEach(async(()=>{
       TestBed.configureTestingModule({
           imports: [
               FormsModule,
               TypeaheadModule.forRoot()
           ],
           declarations: [SearchWrapperComponent, SearchComponent],
           providers: [
               {provide: App, useValue: mockApp}
           ]
       })
           .compileComponents();

       fixture = TestBed.createComponent(SearchWrapperComponent);
       wrapperComponent = fixture.componentInstance;
       searchComponent = wrapperComponent.searchComponent;
       fixture.detectChanges();
   }));

   it('should create the Search Component', () => {
       expect(wrapperComponent).toBeTruthy() ;
   });

    it('should change the input and call the onChange event', async(() => {
        const testValue = 'abc';
        spyOn(wrapperComponent, 'onChange');
        setInputValue('.app-search-input', testValue).then(()=> {
            expect(searchComponent.query).toEqual(testValue);
            expect(wrapperComponent.onChange).toHaveBeenCalledTimes(1);
        });
    }));

    function setInputValue(selector: string, value: string) {
        let input = fixture.debugElement.query(By.css(selector)).nativeElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        return fixture.whenStable();
    }
});