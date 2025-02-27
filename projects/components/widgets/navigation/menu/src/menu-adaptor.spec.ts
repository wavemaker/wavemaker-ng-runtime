import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, Inject, Injector } from '@angular/core';
import { MenuAdapterComponent } from './menu-adapator.component';
import { MenuComponent } from './menu.component';
import { QueryList } from '@angular/core';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
    selector: 'app-test-menu-adapter',
    template: '<div></div>'
})
class TestMenuAdapterComponent extends MenuAdapterComponent {
    constructor(
        injector: Injector,
        @Inject('WIDGET_CONFIG') widgetConfig: any,
        @Inject('EXPLICIT_CONTEXT') explicitContext: any
    ) {
        super(injector, widgetConfig, explicitContext);
    }
}

describe('MenuAdapterComponent', () => {
    let component: TestMenuAdapterComponent;
    let fixture: ComponentFixture<TestMenuAdapterComponent>;
    let elementRefMock: ElementRef;
    let nativeElementMock: any;
    let injectorMock: any;
    let mockMenuComponent: any;

    beforeEach(async () => {
        nativeElementMock = document.createElement('div');
        elementRefMock = { nativeElement: nativeElementMock } as ElementRef;

        mockMenuComponent = {
            itemlabel: '',
            binditemlabel: '',
            binditemicon: '',
            binditemaction: '',
            binditemlink: '',
            binduserrole: '',
            binditemchildren: ''
        };

        injectorMock = {
            get: jest.fn().mockImplementation((token) => {
                if (token === ElementRef) return elementRefMock;
                if (token === App) return mockApp;
                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;

        await TestBed.configureTestingModule({
            declarations: [TestMenuAdapterComponent],
            imports: [MenuComponent],
            providers: [
                { provide: Injector, useValue: injectorMock },
                { provide: 'WIDGET_CONFIG', useValue: { widgetType: 'wm-menu' } },
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestMenuAdapterComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call super.onPropertyChange for non-menu properties', () => {
        const superSpy = jest.spyOn(MenuAdapterComponent.prototype, 'onPropertyChange');
        component.onPropertyChange('nonMenuProp', 'newValue', 'oldValue');
        expect(superSpy).toHaveBeenCalledWith('nonMenuProp', 'newValue', 'oldValue');
    });

    it('should update menuRef for menu properties', () => {
        component['menuRef'] = mockMenuComponent;
        component.onPropertyChange('itemlabel', 'newLabel', 'oldLabel');
        expect(mockMenuComponent.itemlabel).toBe('newLabel');
    });

    it('should set up menuRef in ngAfterViewInit', () => {
        const mockQueryList = new QueryList<MenuComponent>();
        mockQueryList.reset([mockMenuComponent]);
        (component as any).menuRefQL = mockQueryList;

        const changeSpy = jest.spyOn(mockQueryList.changes, 'subscribe');

        component.ngAfterViewInit();

        expect(changeSpy).toHaveBeenCalled();
        const subscriber = changeSpy.mock.calls[0][0];
        subscriber(mockQueryList);

        expect(component['menuRef']).toBe(mockMenuComponent);
    });

    it('should set bind properties on menuRef', () => {
        const mockQueryList = new QueryList<MenuComponent>();
        mockQueryList.reset([mockMenuComponent]);
        (component as any).menuRefQL = mockQueryList;

        component['binditemlabel'] = 'testLabel';
        component['binditemicon'] = 'testIcon';
        component['itemlabel'] = 'actualLabel';

        const changeSpy = jest.spyOn(mockQueryList.changes, 'subscribe');

        component.ngAfterViewInit();

        const subscriber = changeSpy.mock.calls[0][0];
        subscriber(mockQueryList);

        expect(mockMenuComponent.binditemlabel).toBe('testLabel');
        expect(mockMenuComponent.binditemicon).toBe('testIcon');
        expect(mockMenuComponent.itemlabel).toBe('actualLabel');
    });
});