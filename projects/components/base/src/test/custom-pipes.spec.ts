import { ToNumberPipe } from '../pipes/custom-pipes';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { Component, Injector, OnInit } from '@angular/core';
import { compileTestComponent, mockApp } from './util/component-test-util';
import { ITestModuleDef } from './common-widget.specs';
import { CustomPipe, FileExtensionFromMimePipe, FileIconClassPipe, FileSizePipe, FilterPipe, ImagePipe, NumberToStringPipe, PrefixPipe, StateClassPipe, StringToNumberPipe, SuffixPipe, TimeFromNowPipe, ToCurrencyPipe, ToDatePipe, TrailingZeroDecimalPipe, TrustAsPipe, SanitizePipe } from '@wm/components/base';
import { AbstractI18nService, App, CustomPipeManager } from '@wm/core';
import { MockAbstractI18nService } from './util/date-test-util';

import * as momentLib  from 'moment';
const moment = momentLib.default || window['moment'];

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    _WM_APP_PROJECT: {
        isPreview: true,
        cdnUrl: 'undefined'
    },
    transformFileURI: jest.fn(url => url)
}));

@Component({
    template: '<div></div>',
    standalone: false
})
class PipeWrapperComponent implements OnInit {
    ngOnInit() {
    }

}

const testModuleDef: ITestModuleDef = {
    imports: [
        BrowserModule,
        PipeWrapperComponent
    ],
    declarations: [],
    providers: [{ provide: App, useValue: mockApp },
    { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        DecimalPipe, DatePipe, TrustAsPipe, SanitizePipe, CustomPipeManager
    ]
};

describe('ToNumber pipe', () => {
    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: ToNumberPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new ToNumberPipe(TestBed.inject(DecimalPipe), TestBed.inject(AbstractI18nService));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should display a number with two fractions', () => {
        const result = pipe.transform('678.989898', 2);
        expect(result).toBe('678.99');
    });
});



describe('Trailingzero pipe', () => {
    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: TrailingZeroDecimalPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new TrailingZeroDecimalPipe(TestBed.inject(DecimalPipe));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should get the decimal number without trailingzero', () => {
        const result = pipe.transform("3454.20", 'en', "1.0-16", null, false, '20');
        expect(result).toBe('3,454.2');
    });

    it('should get the decimal number with trailingzero', () => {
        const result = pipe.transform("3454.200", 'en', "1.0-16", null, true, '20');
        expect(result).toBe('3,454.20');
    });
});

describe('ToDate pipe', () => {
    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: ToDatePipe;
    let customPipeManager: CustomPipeManager;
    let i18nService: AbstractI18nService;
    let datePipe: DatePipe;

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        customPipeManager = TestBed.inject(CustomPipeManager);
        i18nService = TestBed.inject(AbstractI18nService);
        datePipe = TestBed.inject(DatePipe);
        pipe = TestBed.runInInjectionContext(() => new ToDatePipe(datePipe, i18nService, customPipeManager));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should transform the date to the format dd/MM/yyyy', () => {
        const date = new Date('12/14/2020 09:07:05:055');
        const result = pipe.transform(date, 'dd/MM/yyyy');
        expect(result).toBe('14/12/2020');
    });

    it('should transform the date to the format yyyy-MM-dd', () => {
        const date = new Date('04/03/2020 09:07:05:055');
        const result = pipe.transform(date, 'yyyy-MM-dd');
        expect(result).toBe('2020-04-03');
    });

    it('should transform the date to the format yyyy-M-dd', () => {
        const date = new Date('04/03/2020 09:07:05:055');
        const result = pipe.transform(date, 'yyyy-M-dd');
        expect(result).toBe('2020-4-03');
    });

    it('should transform the date to the format yyyy-MM-dd hh:mm:ss:sss Z', () => {
        const date = new Date('04/03/2020 09:07:05:055');
        const result = pipe.transform(date, 'yyyy-MM-dd hh:mm:ss:sss Z');
        expect(result).toBe('2020-04-03 09:07:05:055 ' + date.toString().match(/([-\+][0-9]+)\s/)[1]);

    });

    it('should transform the date to the format MM-dd-yy hh:mm:ss a', () => {
        const date = new Date('04/03/2020 09:07:05:055')
        const result = pipe.transform(date, 'MM-dd-yy hh:mm:ss a');
        expect(result).toBe('04-03-20 09:07:05 AM');

    });

    it('should transform the date to the format M-dd-yyyy', () => {
        const date = new Date('04/03/2020 09:07:05:055')
        const result = pipe.transform(date, 'M-dd-yyyy');
        expect(result).toBe('4-03-2020');
    });

    it('should transform the date to timestamp', () => {
        const date = new Date('04/03/2020 09:07:05:055');
        const result = pipe.transform(date, 'timestamp');
        expect(result).toBe(date.getTime());
    });

    it('should return empty string when data is invalid', () => {
        const date = new Date('04/03/2020 09:07:05:055');
        const result = pipe.transform(null, 'timestamp');
        expect(result).toBe('')
    });

    it('should return empty string for undefined input', () => {
        const result = pipe.transform(undefined, 'yyyy-MM-dd');
        expect(result).toBe('');
    });

    it('should use custom formatter if isCustomPipe is true', () => {
        const customPipe = {
            formatter: jest.fn().mockReturnValue('Custom formatted date')
        };
        jest.spyOn(customPipeManager, 'getCustomPipe').mockReturnValue(customPipe);

        // Re-instantiate the pipe to trigger the constructor logic
        pipe = TestBed.runInInjectionContext(() => 
            new ToDatePipe(datePipe, i18nService, customPipeManager)
        );

        const result = pipe.transform('2021-09-20', 'yyyy-MM-dd');
        expect(result).toBe('Custom formatted date');
        expect(customPipe.formatter).toHaveBeenCalled();
    });

    it('should return ISO string for UTC format', () => {
        const timestamp = 1632154800000; // 2021-09-20T12:00:00.000Z
        const result = pipe.transform(timestamp, 'UTC');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should format date with timezone offset', () => {
        const timestamp = 1632154800000; // 2021-09-20T12:00:00.000Z
        jest.spyOn(i18nService, 'getTimezone').mockReturnValue('America/New_York');

        const result = pipe.transform(timestamp, 'yyyy-MM-dd HH:mm:ss');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle hasOffsetStr case', () => {
        const dateWithOffset = '2021-09-20T12:00:00+05:30';

        const result = pipe.transform(dateWithOffset, 'yyyy-MM-dd HH:mm:ss');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle null data', () => {
        const result = pipe.transform(null, 'yyyy-MM-dd');
        expect(result).toBe('');
    });

    it('should handle empty string data', () => {
        const result = pipe.transform('', 'yyyy-MM-dd');
        expect(result).toBe('');
    });
});

describe('StringToNumber pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: StringToNumberPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new StringToNumberPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should convert the number string  to number type', () => {
        const result = pipe.transform('345');
        expect(result).toBe(345);
    });

    it("should handle data undefined", () => {
        const result = pipe.transform(undefined);
        expect(result).toBe(undefined);
    })
});

describe('NumberToString pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: NumberToStringPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new NumberToStringPipe(TestBed.inject(DecimalPipe), TestBed.inject(AbstractI18nService));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should convert number  to string with fraction ', () => {
        const result = pipe.transform(1212.23554, '2');
        expect(result).toBe('1,212.24');
    });

    it('should convert number  to string', () => {
        const result = pipe.transform(121, '');
        expect(result).toBe('121');
    });



});

describe('Prefix pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: PrefixPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new PrefixPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should add prefix value', () => {
        const result = pipe.transform(' world', 'Hello');
        expect(result).toBe('Hello world');
    });


});


describe('Suffix pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: SuffixPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new SuffixPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should add prefix value', () => {
        const result = pipe.transform('Test', ' Me');
        expect(result).toBe('Test Me');
    });


});

describe('ToCurrency pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: ToCurrencyPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new ToCurrencyPipe(TestBed.inject(DecimalPipe), TestBed.inject(AbstractI18nService));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should add $ currency symbol with fraction 2', () => {
        const result = pipe.transform(2345.452, '$', 2);
        expect(result).toBe('$2,345.45');
    });

    it('should add $ currency symbol', () => {
        const result = pipe.transform(2345.452, '$', '');
        expect(result).toBe('$2,345.452');
    });

    it("should handle negative number", () => {
        const result = pipe.transform(-2345.452, '$', '');
        expect(result).toBe('-$2,345.452');
    })

});

describe('TimeFromNow pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: TimeFromNowPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        moment.locale('en');
        pipe = new TimeFromNowPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should show the timestamp from now as 2 days ago', () => {
        let date = new Date();
        date.setDate(date.getDate() - 2);
        const result = pipe.transform(date.getTime());
        expect(result).toBe('2 days ago');
    });

    it('should show the date from now as a day ago', () => {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        const result = pipe.transform(date);
        expect(result).toBe('a day ago');
    });

    it('should show the date from now "in 2 days"', () => {
        let date = new Date();
        date.setDate(date.getDate() + 2);
        const result = pipe.transform(date);
        expect(result).toBe('in 2 days');
    });

    it("should handle data undefined", () => {
        const result = pipe.transform(undefined);
        expect(result).toBe(undefined);
    });

});

describe('Filter pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: FilterPipe;
    let data = [{
        name: 'Ram',
        age: 23,
        DOB: 34543455,
        id: 234

    },
    {
        name: 'Devid',
        age: 24,
        DOB: 54543455,
        id: 23

    },
    {
        name: 'Ben',
        age: 24,
        DOB: 24543455,
        id: 24

    }];

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new FilterPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should filter and find the Ben named object', () => {
        let find = [{
            name: 'Ben',
            age: 24,
            DOB: 24543455,
            id: 24

        }];
        const result = pipe.transform(data, find[0], null);
        expect(JSON.stringify(result)).toBe(JSON.stringify(find));
    });

    it('should find the object with feild name and value as "Ben"', () => {
        let find = [{
            name: 'Ben',
            age: 24,
            DOB: 24543455,
            id: 24

        }];
        const result = pipe.transform(data, 'name', 'Ben');
        expect(JSON.stringify(result)).toBe(JSON.stringify(find));
    });

    it("should handle data undefined", () => {
        const result = pipe.transform(undefined, 'name', 'Ben');
        expect(result).toEqual([]);
    })

});

describe('FileSize pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: FileSizePipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new FileSizePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should convert the filesize from bytes to KB with 2 precision', () => {
        const result = pipe.transform(2056, 2);
        expect(result).toBe('2.01 KB');
    });

    it('should convert the filesize from bytes to MB with 2 precision', () => {
        const result = pipe.transform(2056679, 2);
        expect(result).toBe('1.96 MB');
    });

    it('should show the file size n bytes', () => {
        const result = pipe.transform(200, 2);
        expect(result).toBe('200.00 bytes');
    });

    it('should convert the filesize from bytes to GB with 2 precision', () => {
        const result = pipe.transform(2056679804, 2);
        expect(result).toBe('1.92 GB');
    });


});

describe('FileIconClass pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: FileIconClassPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new FileIconClassPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should  get the zip file class', () => {
        const result = pipe.transform('zip');
        expect(result).toBe('fa fa-file-zip-o');
    });

    it('should get pdf file class', () => {
        const result = pipe.transform('pdf');
        expect(result).toBe('fa fa-file-pdf-o');
    });

    it('should get the mp4 file class', () => {
        const result = pipe.transform('mp4');
        expect(result).toBe('fa fa-file-movie-o');
    });

    it('should get the image file class', () => {
        const result = pipe.transform('jpg');
        expect(result).toBe('fa fa-file-image-o');
    });

    it('should get the html file class', () => {
        const result = pipe.transform('html');
        expect(result).toBe('fa fa-file-code-o');
    });

    it('should get the JS file class', () => {
        const result = pipe.transform('js');
        expect(result).toBe('fa fa-file-code-o');
    });

    it('should get the audio file class', () => {
        const result = pipe.transform('mp3');
        expect(result).toBe('fa fa-file-audio-o');
    });

    it('should get the default file class', () => {
        const result = pipe.transform(null);
        expect(result).toBe('fa fa-file-o');
    });

});

describe('StateClass pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: StateClassPipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new StateClassPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should get the success state class name(Lowercase)', () => {
        const result = pipe.transform('success');
        expect(result).toBe('wi wi-check-circle text-success');
    });

    it('should get the success state class name(Uppercase)', () => {
        const result = pipe.transform('SUCCESS');
        expect(result).toBe('wi wi-check-circle text-success');
    });

    it('should get the error state class name(Lowercase)', () => {
        const result = pipe.transform('error');
        expect(result).toBe('wi wi-error text-danger');
    });

    it('should get the error state class name(Uppercase)', () => {
        const result = pipe.transform('ERROR');
        expect(result).toBe('wi wi-error text-danger');
    });
});

describe('fileExtensionFromMime pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: FileExtensionFromMimePipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new FileExtensionFromMimePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should get the audio file extension', () => {
        const result = pipe.transform('audio/aac');
        expect(result).toBe('.aac');
    });

    it('should get the octet-stream file extension', () => {
        const result = pipe.transform('application/octet-stream');
        expect(result).toBe('.bin');
    });

    it('should get the text/csv file extension', () => {
        const result = pipe.transform('text/csv');
        expect(result).toBe('.csv');
    });

    it('should get the video webm file extension', () => {
        const result = pipe.transform('video/webm');
        expect(result).toBe('.webm');
    });

    it('should get the pdf  file extension', () => {
        const result = pipe.transform('application/pdf');
        expect(result).toBe('.pdf');
    });

    it('should get the png  file extension', () => {
        const result = pipe.transform('image/png');
        expect(result).toBe('.png');
    });

    it('should get the tar file extension', () => {
        const result = pipe.transform('application/x-tar');
        expect(result).toBe('.tar');
    });

    it('should get the plain text file extension', () => {
        const result = pipe.transform('text/plain');
        expect(result).toBe('.txt');
    });

    it('should get the zip file extension', () => {
        const result = pipe.transform('application/zip');
        expect(result).toBe('.zip');
    });
});

describe('Image pipe', () => {
    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: ImagePipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        pipe = new ImagePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should get the resource image url', () => {
        const result = pipe.transform("resources/images/logos/wm-brand-logo.png");
        expect(result).toBe('resources/images/logos/wm-brand-logo.png');
    });

    it('should get the resource image url without encoding', () => {
        const result = pipe.transform("resources/images/logos/wm-brand logo.png");
        expect(result).toBe('resources/images/logos/wm-brand logo.png');
    });

    it('should get the resource image url with encoding', () => {
        const result = pipe.transform("resources/images/logos/wm-brand logo.png", true);
        expect(result).toBe('resources/images/logos/wm-brand%20logo.png');
    });

    it('should get the resource image query param url with encoding', () => {
        const result = pipe.transform("resources/images/logos/wm-brand-logo.png?test=' test'", true);
        expect(result).toBe("resources/images/logos/wm-brand-logo.png?test='%20test'");
    });


    it('should get the default image url', () => {
        const result = pipe.transform('');
        expect(result).toBe('resources/images/imagelists/default-image.png');
    });

    it('should get the given default image url', () => {
        const result = pipe.transform('', true, 'resources/images/imagelists/default.png');
        expect(result).toBe('resources/images/imagelists/default.png');
    });


    it('should get the valid web image url', () => {
        const result = pipe.transform('https://s3.amazonaws.com/wmstudio-apps/salesrep/Amanda-Brown.png');
        expect(result).toBe('https://s3.amazonaws.com/wmstudio-apps/salesrep/Amanda-Brown.png');
    });
});


describe('TrustAs, Sanitize pipes', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let trustAsPipe: TrustAsPipe;
    let sanitizePipe: SanitizePipe;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        trustAsPipe = new TrustAsPipe(TestBed.inject(DomSanitizer));
        sanitizePipe = new SanitizePipe(TestBed.inject(DomSanitizer));
    });

    it('create an instance', () => {
        expect(trustAsPipe).toBeTruthy();
        expect(sanitizePipe).toBeTruthy();
    });

    it('should get trusted resource string', () => {
        let logo = "resources/images/logos/wmlogo.png";
        const result = trustAsPipe.transform("resources/images/logos/wmlogo.png", "resource");
        expect(result.toString()).toContain('Safe');
        expect(result[Object.keys(result)[0]]).toBe(logo);
    });

    it('should get trusted html content', () => {
        let html = '<span style="background-color: rgb(255, 255, 1);">text with color</span>';
        const result = trustAsPipe.transform(html, 'html');
        expect(result.toString()).toContain('Safe');
        expect(result[Object.keys(result)[0]]).toBe(html);
    });

    it('should get sanitized html string', () => {
        let html = "<div> <span>Welcome</span> </div>";
        const result = sanitizePipe.transform(html, "html");
        expect(result).toBe(html);
    });

    it('should get sanitized html content', () => {
        let html = '<span style="background-color: rgb(255, 255, 1);">text with color</span>';
        const result = sanitizePipe.transform(html, 'html');
        expect(result).toBe('<span>text with color</span>');
    });
});

describe('Custom pipe', () => {

    let fixture: ComponentFixture<PipeWrapperComponent>;
    let pipe: CustomPipe;
    let wrapperComponent: PipeWrapperComponent;
    let customPipeManager: CustomPipeManager;
    let injector : Injector

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, PipeWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        customPipeManager = TestBed.inject(CustomPipeManager);
        injector = TestBed.inject(Injector)
         pipe = TestBed.runInInjectionContext(() => new CustomPipe(customPipeManager));
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return the data when invalid pipe name was given', () => {
        const result = pipe.transform('987757765675', "phonenumbertest");
        expect(result).toBe('987757765675');
    });

    it('should set the pipe and return the formatted phone number', () => {
        (pipe as any).custmeUserPipe.setCustomPipe('customfractionformatphone', {
            formatter: function (data) {
                return '+91 ' + data;
            }

        });
        const result = pipe.transform('7878497872', "customfractionformatphone");
        expect(result).toBe('+91 7878497872');
    });

    it('should handle no additional arguments', () => {
        const mockVariables = { someVar: 'value' };
        (pipe as any).app = { Variables: mockVariables };
        const mockFormatter = jest.fn((data, mockVariables) => `formatted-${data}`);
        jest.spyOn(customPipeManager, 'getCustomPipe').mockReturnValue({ formatter: mockFormatter });

        const result = pipe.transform('testData', 'testPipe');
        expect(result).toBe('formatted-testData');
        expect(mockFormatter).toHaveBeenCalledWith('testData', mockVariables);
    });

    it('should catch and log errors from formatter', () => {
        const mockFormatter = jest.fn(() => { throw new Error('Test error'); });
        jest.spyOn(customPipeManager, 'getCustomPipe').mockReturnValue({ formatter: mockFormatter });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const result = pipe.transform('testData', 'testPipe');

        expect(result).toBe('testData');
        expect(consoleSpy).toHaveBeenCalledWith('Pipe name: testPipe', expect.any(Error));
    });

    it('should return original data when formatter throws an error', () => {
        const mockFormatter = jest.fn(() => { throw new Error('Test error'); });
        jest.spyOn(customPipeManager, 'getCustomPipe').mockReturnValue({ formatter: mockFormatter });

        const result = pipe.transform('testData', 'testPipe');
        expect(result).toBe('testData');
    });

    it('should handle multiple arguments passed directly to transform', () => {
        const mockVariables = { someVar: 'value' };
        (pipe as any).app = { Variables: mockVariables };

        const mockFormatter = jest.fn((data, ...args) => {
        // Remove the Variables object from args for the expected result
         const actualArgs = args.slice(0, -1);
         return `formatted-${data}-${actualArgs.join('-')}`
        });
        jest.spyOn(customPipeManager, 'getCustomPipe').mockReturnValue({ formatter: mockFormatter });

        // Call transform with multiple arguments
        const result = (pipe as any).transform('testData', 'testPipe', 'arg1', 'arg2', 'arg3');

        expect(result).toBe('formatted-testData-arg1-arg2-arg3');
        expect(mockFormatter).toHaveBeenCalledWith('testData', 'arg1', 'arg2', 'arg3', mockVariables);
    });
});

