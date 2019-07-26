import { TestBed } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { TrustAsPipe } from "projects/components/src/pipes/trust-as.pipe";
import { FormBuilder } from "@angular/forms";
import { App, DynamicComponentRefProvider } from "@wm/core";
import { TableComponent } from "./table.component";

@Component({
    template:`<div wmTable></div>`
})
class TestComponent {

}

describe('DataTable',()=>{
    let fixture;
    beforeEach(()=>{
        let Dependencies  = [
            TrustAsPipe
        ];

        TestBed.configureTestingModule({
            declarations: [
                TestComponent,
                ...Dependencies,
                TableComponent
            ],
            providers: [
                { provide: FormBuilder, useValue: {group:()=>{}} },
                { provide: App, useValue:{subscribe:()=>{}}},
                { provide: DynamicComponentRefProvider, useValue:{}}
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
    })
    it('With Default Settings',()=>{
        const divEl : HTMLElement = fixture.nativeElement.querySelector('div');
        expect(divEl).not.toBeNull();
        // pending(`Yet to be added`);

    })
    it('Quick Edit Mode',()=>{
        pending(`Yet to be added`);
    })
});
