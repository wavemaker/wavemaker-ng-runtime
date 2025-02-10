import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from "@angular/core";
import { SpinnerComponent } from "./spinner.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { App, AppDefaults } from "@wm/core";
import { ImagePipe, StylableComponent, ToDatePipe, TrustAsPipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { mockApp } from "projects/components/base/src/test/util/component-test-util";

const markup = `<div wmSpinner #wm_spinner1="wmSpinner" [attr.aria-label]="wm_spinner1.arialabel || 'Loading...'" hint="Loading..." name="spinner1">`;

@Component({
    template: markup
})
class SpinnerWrapperComponent {
    @ViewChild(SpinnerComponent, { static: true }) wmComponent: SpinnerComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [SpinnerComponent],
    declarations: [SpinnerWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: ImagePipe, useClass: ImagePipe },
        { provide: TrustAsPipe, useClass: TrustAsPipe }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-spinner',
    widgetSelector: '[wmSpinner]',
    testModuleDef: testModuleDef,
    testComponent: SpinnerWrapperComponent,
};


const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('SpinnerComponent', () => {
    let component: SpinnerComponent;
    let fixture: ComponentFixture<SpinnerWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule(testModuleDef).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SpinnerWrapperComponent);
        component = fixture.componentInstance.wmComponent;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set animation class correctly', () => {
        component.onPropertyChange('animation', 'spin');
        expect(component.animation).toBe('fa-spin');

        component.onPropertyChange('animation', 'custom-animation');
        expect(component.animation).toBe('custom-animation');

        component.onPropertyChange('animation', '');
        expect(component.animation).toBe('');
    });

    it('should set picture using ImagePipe', () => {
        const mockImagePath = 'path/to/image.png';
        const mockTransformedPath = 'transformed/path.png';
        jest.spyOn(component['imagePipe'], 'transform').mockReturnValue(mockTransformedPath);

        component.onPropertyChange('image', mockImagePath);
        expect(component['picture']).toBe(mockTransformedPath);
        expect(component['imagePipe'].transform).toHaveBeenCalledWith(mockImagePath);
    });

    it('should set spinnerMessages and update showCaption', () => {
        component.spinnerMessages = ['Message 1', 'Message 2'];
        expect(component.spinnerMessages).toEqual(['Message 1', 'Message 2']);
        expect(component.showCaption).toBeFalsy();

        component.spinnerMessages = [];
        expect(component.spinnerMessages).toEqual([]);
        expect(component.showCaption).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
        expect(component.iconclass).toBe('fa fa-circle-o-notch fa-spin');
        expect(component.animation).toBe('fa-spin');
        expect(component.show).toBeDefined();
        expect(component.showCaption).toBeTruthy();
    });
    describe('listenOnDataSource', () => {
        let mockAppInstance: Partial<App>;
        let mockSubscribe: jest.Mock;
        let subscribeCallback: (data: any) => void;

        beforeEach(() => {
            mockSubscribe = jest.fn().mockImplementation((event, callback) => {
                subscribeCallback = callback;
            });
            mockAppInstance = {
                subscribe: mockSubscribe,
            };
            (global as any).validateDataSourceCtx = jest.fn().mockReturnValue(true);

            // Mock DataSource.Operation.GET_NAME
            (global as any).DataSource = {
                Operation: {
                    GET_NAME: 'GET_NAME'
                }
            };
            component.servicevariabletotrack = 'var1,var2';
            jest.spyOn(component as any, 'getAppInstance').mockReturnValue(mockAppInstance);
            jest.spyOn(component as any, 'getViewParent').mockReturnValue({});

            // Mock lodash functions
            (global as any)._ = {
                split: jest.fn().mockImplementation((str, separator) => str.split(separator)),
                includes: jest.fn().mockImplementation((array, item) => array.includes(item)),
                isArray: jest.fn().mockImplementation(Array.isArray),
                isFunction: jest.fn().mockImplementation((fn) => typeof fn === 'function'),
                forEach: jest.fn().mockImplementation((collection, iteratee) => {
                    if (Array.isArray(collection)) {
                        collection.forEach(iteratee);
                    } else if (typeof collection === 'object' && collection !== null) {
                        Object.keys(collection).forEach(key => iteratee(collection[key], key));
                    }
                }),
                map: jest.fn().mockImplementation((collection, iteratee) => {
                    if (Array.isArray(collection)) {
                        return collection.map(iteratee);
                    } else if (typeof collection === 'object' && collection !== null) {
                        return Object.keys(collection).map(key => iteratee(collection[key], key));
                    }
                    return [];
                }),
                startsWith: jest.fn().mockImplementation((value: any, target: string, position: number = 0) => {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return value.substring(position).indexOf(target) === 0;
                }),
            };

            // Mock validateDataSourceCtx
            (global as any).validateDataSourceCtx = jest.fn().mockReturnValue(true);

            // Mock DataSource.Operation.GET_NAME
            (global as any).DataSource = {
                Operation: {
                    GET_NAME: 'GET_NAME'
                }
            };
        });

        it('should subscribe to toggle-variable-state event', () => {
            (component as any).servicevariabletotrack = 'var1,var2';
            (component as any).listenOnDataSource();

            expect(mockSubscribe).toHaveBeenCalledWith('toggle-variable-state', expect.any(Function));
        });

        it('should update widget.show when variable name matches and context is valid', () => {
            (component as any).listenOnDataSource();

            subscribeCallback({
                variable: {
                    execute: jest.fn().mockReturnValue('var1')
                },
                active: true
            });

            expect((component as any).widget.show).toBe(true);
        });
        it('should not update widget.show when variable name does not match', () => {
            (component as any).servicevariabletotrack = 'var1,var2';
            (component as any).widget = { show: false };
            (component as any).listenOnDataSource();

            subscribeCallback({
                variable: {
                    execute: jest.fn().mockReturnValue('var3')
                },
                active: true
            });

            expect((component as any).widget.show).toBe(false);
        });

        it('should not update widget.show when context is invalid', () => {
            (global as any).validateDataSourceCtx = jest.fn().mockReturnValue(false);

            (component as any).listenOnDataSource();

            subscribeCallback({
                variable: {
                    execute: jest.fn().mockReturnValue('var1')
                },
                active: true
            });

            expect((component as any).widget.show).toBe(true);
        });
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            component['initState'] = new Map();
            component['initState'].set('name', 'testSpinner');
            component['setInitProps'] = jest.fn();
            component['getAppInstance'] = jest.fn().mockReturnValue({
                subscribe: jest.fn()
            });
            component['getViewParent'] = jest.fn().mockReturnValue({});
            (component as any).widget = { show: true };

            fixture.detectChanges();
        });
        it('should call super.ngOnInit() and setInitProps', () => {
            const superNgOnInitSpy = jest.spyOn(StylableComponent.prototype, 'ngOnInit');
            const setInitPropsSpy = jest.spyOn(component as any, 'setInitProps');

            component.ngOnInit();

            expect(superNgOnInitSpy).toHaveBeenCalled();
            expect(setInitPropsSpy).toHaveBeenCalled();
        });

        it('should not set up listener when servicevariabletotrack is not set', () => {
            const listenOnDataSourceSpy = jest.spyOn(component as any, 'listenOnDataSource');
            component.servicevariabletotrack = '';

            component.ngOnInit();

            expect(listenOnDataSourceSpy).not.toHaveBeenCalled();
            expect((component as any).widget.show).toBe(true);
        });

        it('should set up listener when servicevariabletotrack is set', () => {
            const listenOnDataSourceSpy = jest.spyOn(component as any, 'listenOnDataSource');
            component.servicevariabletotrack = 'var1,var2';

            component.ngOnInit();

            expect(listenOnDataSourceSpy).toHaveBeenCalled();
            expect((component as any).widget.show).toBe(false);
        });
    });

});
