import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaptionPositionDirective } from './caption-position.directive';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
        standalone: true,
    template: `
    <div wmCaptionPosition>
      <input type="text" placeholder="Test Input">
    </div>
  `
})
class TestComponent { }

describe('CaptionPositionDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    let directive: CaptionPositionDirective;
    let mockWidget: any;

    beforeEach(async () => {
        mockWidget = {
            $attrs: new Map([['captionposition', 'floating']]),
            form: {
                $attrs: new Map([['captionposition', 'floating']])
            }
        };

        await TestBed.configureTestingModule({
            imports: [CaptionPositionDirective,     TestComponent],
            declarations: [],
            providers: [
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));
        directive = fixture.debugElement.query(By.directive(CaptionPositionDirective)).injector.get(CaptionPositionDirective);

        Object.defineProperty(directive['elementRef'].nativeElement, 'widget', {
            get: () => mockWidget
        });
        directive['elementRef'].nativeElement.querySelector = () => inputEl.nativeElement;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should remove float-active class on blur when input is empty', () => {
        inputEl.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        inputEl.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.parent.nativeElement.classList.contains('float-active')).toBeFalsy();
    });

    it('should set placeholder on focus', () => {
        const placeholderValue = 'Test Input';
        inputEl.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(inputEl.nativeElement.getAttribute('placeholder')).toBe(placeholderValue);
    });

    it('should remove placeholder on blur when input is empty', () => {
        inputEl.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        inputEl.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(inputEl.nativeElement.getAttribute('placeholder')).toBeFalsy();
    });

    it('should set default value animation when there is a default value', () => {
        inputEl.nativeElement.value = 'Default Value';
        directive['setDefaultValueAnimation']();
        expect(directive['compositeEle'].classList.contains('float-active')).toBeTruthy();
    });

    it('should not set default value animation when there is no default value', () => {
        inputEl.nativeElement.value = '';
        directive['setDefaultValueAnimation']();
        expect(directive['compositeEle'].classList.contains('float-active')).toBeFalsy();
    });

    describe('observeForPlaceholderAttrChange', () => {
        let mockMutationObserver: jest.Mock;
        let mockObserve: jest.Mock;
        let mockDisconnect: jest.Mock;

        beforeEach(() => {
            mockObserve = jest.fn();
            mockDisconnect = jest.fn();

            mockMutationObserver = jest.fn().mockImplementation(function (this: any, callback: MutationCallback) {
                this.callback = callback;
                this.observe = mockObserve;
                this.disconnect = mockDisconnect;
            });

            (window as any).MutationObserver = mockMutationObserver;

            directive['inputEl'] = {
                attr: jest.fn().mockReturnValue('Test Placeholder'),
                removeAttr: jest.fn(),
                0: {} as Element
            } as any;

            directive['compositeEle'] = {
                classList: {
                    contains: jest.fn().mockReturnValue(false)
                }
            } as any;
        });

        it('should create a MutationObserver', () => {
            directive['observeForPlaceholderAttrChange']();
            expect(mockObserve).toHaveBeenCalledWith(directive['inputEl'][0], {
                attributes: true,
                childList: false,
                characterData: false
            });
        });

        it('should update placeholder when attribute changes', () => {
            directive['observeForPlaceholderAttrChange']();

            const mockMutation = {
                attributeName: 'placeholder'
            } as MutationRecord;

            (directive['_attrObserver'] as any).callback([mockMutation]);

            expect(directive['placeholder']).toBe('Test Placeholder');
            expect(directive['inputEl'].removeAttr).toHaveBeenCalledWith('placeholder');
        });

        it('should not update placeholder when attribute is not placeholder', () => {
            directive['observeForPlaceholderAttrChange']();

            const mockMutation = {
                attributeName: 'class'
            } as MutationRecord;

            (directive['_attrObserver'] as any).callback([mockMutation]);

            expect(directive['placeholder']).toBeUndefined();
            expect(directive['inputEl'].removeAttr).not.toHaveBeenCalled();
        });

        it('should not update placeholder when float-active class is present', () => {
            jest.spyOn(directive['compositeEle'].classList, 'contains').mockReturnValue(true);

            directive['observeForPlaceholderAttrChange']();

            const mockMutation = {
                attributeName: 'placeholder'
            } as MutationRecord;

            (directive['_attrObserver'] as any).callback([mockMutation]);

            expect(directive['placeholder']).toBeUndefined();
            expect(directive['inputEl'].removeAttr).not.toHaveBeenCalled();
        });

        it('should disconnect observer when directive is destroyed', () => {
            directive['observeForPlaceholderAttrChange']();
            directive.ngOnDestroy();

            expect(mockDisconnect).toHaveBeenCalled();
        });
    });

    describe('checkForRightAlignedForm', () => {
        let $compositeEle: any;
        let mockJQuery: jest.Mock;

        beforeEach(() => {
            mockJQuery = jest.fn().mockImplementation(() => ({
                find: jest.fn().mockReturnThis(),
                closest: jest.fn().mockReturnThis(),
                attr: jest.fn(),
                addClass: jest.fn(),
                length: 1
            }));
            (window as any).$ = mockJQuery;
            $compositeEle = mockJQuery();
            directive['compositeEle'] = document.createElement('div');
            directive['checkForRightAlignedForm'] = directive['checkForRightAlignedForm'].bind(directive);
            directive['inputEl'] = {
                closest: jest.fn().mockReturnValue({
                    attr: jest.fn().mockReturnValue('someValue')
                })
            };
            fixture.detectChanges();
        });

        it('should not add any class when form is not right aligned', () => {
            $compositeEle.closest.mockReturnValue({ length: 0 });
            mockJQuery.mockReturnValue($compositeEle);
            directive['checkForRightAlignedForm']();
            expect($compositeEle.closest).toHaveBeenCalledWith('.align-right');
            expect($compositeEle.find).not.toHaveBeenCalledWith('.input-group-btn');
        });

    });
});