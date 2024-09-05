import { TestBed } from "@angular/core/testing";
import { ConstantService, VALIDATOR } from "@wm/core";
import { FieldTypeService } from "./field-type.service";
import { FieldWidgetService } from "./field-widget.service";

describe('ConstantService', () => {
    let service: ConstantService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConstantService],
        });
        service = TestBed.inject(ConstantService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('MATCH_MODES', () => {
        it('should define MATCH_MODES with correct values', () => {
            const matchModes = {
                STARTS_WITH_IGNORE_CASE: 'startignorecase',
                STARTS_WITH: 'start',
                ENDS_WITH_IGNORE_CASE: 'endignorecase',
                ENDS_WITH: 'end',
                CONTAINS: 'anywhere',
                CONTAINS_IGNORE_CASE: 'anywhereignorecase',
                IS_EQUAL_WITH_IGNORE_CASE: 'exactignorecase',
                IS_EQUAL: 'exact',
            };
            expect(service.MATCH_MODES).toEqual(matchModes);
        });

        it('should have STARTS_WITH mode', () => {
            expect(service.MATCH_MODES.STARTS_WITH).toBe('start');
        });

        it('should have ENDS_WITH_IGNORE_CASE mode', () => {
            expect(service.MATCH_MODES.ENDS_WITH_IGNORE_CASE).toBe('endignorecase');
        });

        it('should have CONTAINS_IGNORE_CASE mode', () => {
            expect(service.MATCH_MODES.CONTAINS_IGNORE_CASE).toBe('anywhereignorecase');
        });
    });

    describe('VALIDATOR', () => {
        it('should have VALIDATOR defined', () => {
            expect(service.VALIDATOR).toBe(VALIDATOR);
        });
    });
});


describe('FieldTypeService', () => {
    let service: FieldTypeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FieldTypeService],
        });
        service = TestBed.inject(FieldTypeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have all field types defined', () => {
        expect(service).toEqual({
            INTEGER: 'integer',
            BIG_INTEGER: 'big_integer',
            SHORT: 'short',
            FLOAT: 'float',
            BIG_DECIMAL: 'big_decimal',
            DOUBLE: 'double',
            LONG: 'long',
            BYTE: 'byte',
            STRING: 'string',
            CHARACTER: 'character',
            TEXT: 'text',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            DATETIME: 'datetime',
            BOOLEAN: 'boolean',
            LIST: 'list',
            CLOB: 'clob',
            BLOB: 'blob'
        });
    });
});


describe('FieldWidgetService', () => {
    let service: FieldWidgetService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FieldWidgetService],
        });
        service = TestBed.inject(FieldWidgetService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have all field widgets defined', () => {
        expect(service).toEqual({
            TEXT: 'text',
            NUMBER: 'number',
            TEXTAREA: 'textarea',
            PASSWORD: 'password',
            CHECKBOX: 'checkbox',
            SLIDER: 'slider',
            RICHTEXT: 'richtext',
            CURRENCY: 'currency',
            SWITCH: 'switch',
            SELECT: 'select',
            CHECKBOXSET: 'checkboxset',
            RADIOSET: 'radioset',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            UPLOAD: 'upload',
            RATING: 'rating',
            DATETIME: 'datetime',
            AUTOCOMPLETE: 'autocomplete',
            CHIPS: 'chips',
            COLORPICKER: 'colorpicker'
        });
    });
});