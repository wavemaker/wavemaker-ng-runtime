import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormControlName, AbstractControl } from '@angular/forms';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { Component, Injector } from '@angular/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { App } from '@wm/core';


// Mock BaseFormComponent
@Component({
    template: ''
})
class MockBaseFormComponent {
    // Add any necessary properties or methods from BaseFormComponent
    protected inj: Injector;
    constructor(injector: Injector) {
        this.inj = injector;
    }
    ngOnInit() { }
    invokeOnChange() { }
    updatePrevDatavalue() { }
    invokeEventCallback() { }
}

// Create a testable version of BaseFormCustomComponent
@Component({
    template: ''
})
class TestableBaseFormCustomComponent extends MockBaseFormComponent implements Partial<BaseFormCustomComponent> {
    protected _onChange: any = () => { };
    protected _onTouched: any = () => { };
    datavalue: any;
    isDestroyed: boolean = false;
    show: boolean = true;
    required: boolean = false;

    constructor(injector: Injector) {
        super(injector);
    }

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    writeValue(value: any) {
        if (this.isDestroyed) {
            return;
        }
        this.datavalue = value; 
        this._onChange(value);
    }

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.show ? validateRequiredBind(this.required)(control) : null;
    }

    // Add other methods as needed
}

describe('BaseFormCustomComponent', () => {
    let component: TestableBaseFormCustomComponent;
    let fixture: ComponentFixture<TestableBaseFormCustomComponent>;
    let injector: Injector;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestableBaseFormCustomComponent, ReactiveFormsModule],
            providers: [
                {
                    provide: App,
                    useValue: mockApp
                }
            ]
        }).compileComponents();

        injector = TestBed.inject(Injector);
        fixture = TestBed.createComponent(TestableBaseFormCustomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('registerOnChange', () => {
        it('should set _onChange', () => {
            const fn = jest.fn();
            component.registerOnChange(fn);
            expect(component['_onChange']).toBe(fn);
        });
    });

    describe('registerOnTouched', () => {
        it('should set _onTouched', () => {
            const fn = jest.fn();
            component.registerOnTouched(fn);
            expect(component['_onTouched']).toBe(fn);
        });
    });

    describe('writeValue', () => {
        it('should not update if component is destroyed', () => {
            component.isDestroyed = true;
            component.writeValue('test');
            expect(component.datavalue).toBeUndefined();
        });

        it('should update datavalue and call _onChange', () => {
            const onChangeSpy = jest.fn();
            component.registerOnChange(onChangeSpy);
            component.writeValue('test');
            expect(component.datavalue).toBe('test');
            expect(onChangeSpy).toHaveBeenCalledWith('test');
        });
    });
    describe('validate', () => {
        it('should return null when show is false', () => {
            component.show = false;
            const control = new FormBuilder().control('');
            expect(component.validate(control)).toBeNull();
        });

        it('should return validation result when show is true and required is true', () => {
            component.show = true;
            component.required = true;
            const control = new FormBuilder().control('');
            expect(component.validate(control)).toEqual({ required: true });
        });
    });
});

// Utility functions
function isValidValue(val: any): boolean {
    switch (typeof val) {
        case 'object': return (!!val && (!!val.length || !!Object.keys(val).length));
        case 'number': return (!!val || val === 0);
        default: return !(val === undefined || val === null || val === '');
    }
}

function validateRequiredBind(required: boolean): (control: AbstractControl) => { [key: string]: any } | null {
    return (control: AbstractControl) =>
        required
            ? (isValidValue(control.value)
                ? null
                : { required: true })
            : null;
}