import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { DialogHeaderComponent } from './dialog-header.component';
import { DialogRef } from '@wm/components/base';
import { BaseDialog } from '../base-dialog';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

describe('DialogHeaderComponent', () => {
    let component: DialogHeaderComponent;
    let fixture: ComponentFixture<DialogHeaderComponent>;
    let mockDialogRef: jest.Mocked<BaseDialog>;
    let mockElementRef: ElementRef;

    beforeEach(async () => {
        mockDialogRef = {
            close: jest.fn(),
            appLocale: {
                LABEL_CLOSE: 'Close'
            }
        } as unknown as jest.Mocked<BaseDialog>;

        mockElementRef = {
            nativeElement: {
                className: ''
            }
        } as ElementRef;

        await TestBed.configureTestingModule({
            declarations: [DialogHeaderComponent],
            providers: [
                { provide: ElementRef, useValue: mockElementRef },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set default values', () => {
        expect(component.iconwidth).toBe('21px');
        expect(component.iconheight).toBe('21px');
        expect(component.closable).toBe(true);
        expect(component.headinglevel).toBe('h4');
    });

    it('should set isClosable based on closable input', () => {
        component.closable = true;
        expect(component.isClosable).toBe(true);

        component.closable = false;
        expect(component.isClosable).toBe(false);
    });

    it('should call dialogRef.close() when closeDialog is called', () => {
        component.closeDialog();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should set custom icon dimensions', () => {
        component.iconwidth = '30px';
        component.iconheight = '30px';
        expect(component.iconwidth).toBe('30px');
        expect(component.iconheight).toBe('30px');
    });

    it('should set custom heading level', () => {
        component.headinglevel = 'h2';
        expect(component.headinglevel).toBe('h2');
    });

    it('should set heading and subheading', () => {
        component.heading = 'Test Heading';
        component.subheading = 'Test Subheading';
        expect(component.heading).toBe('Test Heading');
        expect(component.subheading).toBe('Test Subheading');
    });

    it('should set titleid', () => {
        component.titleid = 'test-title-id';
        expect(component.titleid).toBe('test-title-id');
    });
});