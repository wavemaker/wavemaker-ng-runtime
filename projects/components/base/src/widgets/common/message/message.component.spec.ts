import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComponent } from './message.component';
import { Injector } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { App, AppDefaults, AbstractI18nService } from '@wm/core';
import { ToDatePipe } from '../../../public_api';
import { mockApp } from '../../../test/util/component-test-util';
import { MockAbstractI18nService } from '../../../test/util/date-test-util';

describe('MessageComponent', () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MessageComponent],
            providers: [
                { provide: Injector, useValue: Injector.create({ providers: [], parent: null }) },
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: DatePipe, useClass: DatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService }

            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should show message with specified caption and type', () => {
        component.showMessage('Message', 'success');
        fixture.detectChanges();
        expect(component.caption).toBe('Message');
        expect(component.type).toBe('success');
        expect(component.messageClass).toBe('alert-success');
        expect(component.messageIconClass).toBe('wm-sl-l sl-check');
    });

    it('should hide the message', () => {
        component.showMessage('Test Caption', 'success');
        fixture.detectChanges();
        component.hideMessage();
        fixture.detectChanges();
        expect(component['show']).toBeFalsy();
    });

    it('should call dismiss method and hide the message', () => {
        component.showMessage('Test Caption', 'success');
        fixture.detectChanges();
        const spy = jest.spyOn(component, 'hideMessage');
        const closeButton = fixture.debugElement.query(By.css('button.close'));
        closeButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
        expect(component['show']).toBeFalsy();
    });

    it('should change message type and classes accordingly', () => {
        component.onPropertyChange('type', 'error');
        expect(component.messageClass).toBe('alert-danger');
        expect(component.messageIconClass).toBe('wi wi-cancel');
    });

    it('should handle different message types correctly', () => {
        const types = [
            { type: 'success', expectedClass: 'alert-success', expectedIconClass: 'wm-sl-l sl-check' },
            { type: 'error', expectedClass: 'alert-danger', expectedIconClass: 'wi wi-cancel' },
            { type: 'warning', expectedClass: 'alert-warning', expectedIconClass: 'wm-sl-l sl-alarm-bell' },
            { type: 'info', expectedClass: 'alert-info', expectedIconClass: 'wi wi-info' },
            { type: 'loading', expectedClass: 'alert-info alert-loading', expectedIconClass: 'fa fa-spinner fa-spin' },
        ];

        types.forEach(({ type, expectedClass, expectedIconClass }) => {
            component.onPropertyChange('type', type);
            expect(component.messageClass).toBe(expectedClass);
            expect(component.messageIconClass).toBe(expectedIconClass);
        });
    });
});