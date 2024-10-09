import { FormWidgetDirective } from './form-widget.directive';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { WidgetRef } from '@wm/components/base';
import { FormComponent } from './form.component';
import { TableComponent } from '@wm/components/data/table';

// Mock WidgetRef interface
interface MockWidgetRef extends WidgetRef {
    registerPropertyChangeListener: jest.Mock;
    datavalue: any;
}

describe('FormWidgetDirective', () => {
    let directive: FormWidgetDirective;
    let mockFormBuilder: jest.Mocked<FormBuilder>;
    let mockForm: jest.Mocked<FormComponent>;
    let mockTable: jest.Mocked<TableComponent>;
    let mockWidgetRef: MockWidgetRef;
    let mockFormGroup: jest.Mocked<FormGroup>;

    beforeEach(() => {
        mockFormBuilder = {
            control: jest.fn().mockReturnValue(new FormControl()),
        } as any;

        mockFormGroup = {
            addControl: jest.fn(),
            controls: {},
        } as any;

        mockForm = {
            ngform: mockFormGroup,
            registerFormWidget: jest.fn(),
        } as any;

        mockTable = {
            ngform: mockFormGroup,
            registerFormWidget: jest.fn(),
        } as any;

        mockWidgetRef = {
            registerPropertyChangeListener: jest.fn(),
            datavalue: 'initialValue',
        } as MockWidgetRef;
    });

    function createDirective(form = mockForm, table = null, name = 'testName', key = null) {
        return new FormWidgetDirective(
            form,
            table,
            mockWidgetRef,
            mockFormBuilder,
            name,
            key
        );
    }

    it('should create an instance', () => {
        directive = createDirective();
        expect(directive).toBeTruthy();
    });

    it('should register property change listener', () => {
        directive = createDirective();
        expect(mockWidgetRef.registerPropertyChangeListener).toHaveBeenCalled();
    });

    it('should add control when name is provided', () => {
        directive = createDirective();
        directive.ngOnInit();
        expect(mockFormGroup.addControl).toHaveBeenCalledWith('testName', expect.any(FormControl));
    });

    it('should add control when key is provided', () => {
        directive = createDirective(mockForm, null, 'testName', 'testKey');
        directive.ngOnInit();
        expect(mockFormGroup.addControl).toHaveBeenCalledWith('testKey', expect.any(FormControl));
    });

    it('should register form widget', () => {
        directive = createDirective();
        directive.ngOnInit();
        expect(mockForm.registerFormWidget).toHaveBeenCalledWith(mockWidgetRef);
    });

    it('should create control with initial datavalue', () => {
        directive = createDirective();
        const result = directive.createControl();
        expect(mockFormBuilder.control).toHaveBeenCalledWith('initialValue');
        expect(result).toBeInstanceOf(FormControl);
    });

    it('should update control value when datavalue property changes', () => {
        directive = createDirective();
        const mockControl = new FormControl();
        jest.spyOn(mockControl, 'setValue');
        mockFormGroup.controls['testName'] = mockControl;

        const propertyChangeListener = mockWidgetRef.registerPropertyChangeListener.mock.calls[0][0];
        propertyChangeListener('datavalue', 'newValue');

        expect(mockControl.setValue).toHaveBeenCalledWith('newValue');
    });

    it('should add control when name property changes and control does not exist', () => {
        directive = createDirective();
        const propertyChangeListener = mockWidgetRef.registerPropertyChangeListener.mock.calls[0][0];
        propertyChangeListener('name', 'newName');

        expect(mockFormGroup.addControl).toHaveBeenCalledWith('newName', expect.any(FormControl));
    });

    it('should work with TableComponent as parent', () => {
        directive = createDirective(null, mockTable);
        expect(directive.parent).toBe(mockTable);
        expect(directive.ngform).toBe(mockTable.ngform);
    });

    it('should return undefined for _control when no name or key is provided', () => {
        directive = createDirective(mockForm, null, null, null);
        expect(directive._control).toBeUndefined();
    });
});