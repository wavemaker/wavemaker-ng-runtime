import {Component, ViewChild} from "@angular/core";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {PictureDirective} from "./picture.directive";
import {App, switchClass} from "@wm/core";
import {ImagePipe} from "@wm/components/base";
import {ComponentFixture} from "@angular/core/testing";
import {compileTestComponent, mockApp} from "projects/components/base/src/test/util/component-test-util";

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    switchClass: jest.fn(),
}));

const markup = `<img wmPicture #wm_picture="wmPicture" [attr.aria-label]="wm_picture.arialabel || 'Picture content'" hint="Picture content" name="picture1" tabindex="0" picturesource="source.jpg" encodeurl="true" pictureplaceholder="placeholder.jpg">`;

@Component({
    template: markup
})

class PictureWrapperDirective {
    @ViewChild(PictureDirective, { static: true }) wmComponent: PictureDirective
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [PictureWrapperDirective, PictureDirective],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ImagePipe, useClass: ImagePipe },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-picture',
    widgetSelector: '[wmPicture]',
    testModuleDef: testModuleDef,
    testComponent: PictureWrapperDirective,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();


describe('PictureDirective', () => {
    let component: PictureWrapperDirective;
    let fixture: ComponentFixture<PictureWrapperDirective>;
    let pictureDirective: PictureDirective;

    beforeEach(async () => {
        fixture = compileTestComponent(testModuleDef, PictureWrapperDirective);
        component = fixture.componentInstance;
        pictureDirective = component.wmComponent;
        fixture.detectChanges();
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(pictureDirective).toBeTruthy();
    });

    it('should set image source correctly', () => {
        pictureDirective.picturesource = 'test.jpg';
        pictureDirective.encodeurl = true;
        pictureDirective.pictureplaceholder = 'placeholder.jpg';
        pictureDirective.setImgSource();
        expect(pictureDirective.imgSource).toBeDefined();
    });

    it('should update picture aspect', () => {
        const nativeElement = pictureDirective.nativeElement;
        pictureDirective.onPropertyChange('pictureaspect', 'H', 'None');
        expect(nativeElement.style.width).toBe('100%');
        expect(nativeElement.style.height).toBe('');

        pictureDirective.onPropertyChange('pictureaspect', 'V', 'H');
        expect(nativeElement.style.width).toBe('');
        expect(nativeElement.style.height).toBe('100%');

        pictureDirective.onPropertyChange('pictureaspect', 'Both', 'V');
        expect(nativeElement.style.width).toBe('100%');
        expect(nativeElement.style.height).toBe('100%');
    });

    it('should call switchClass when shape property changes', () => {
        pictureDirective.onPropertyChange('shape', 'round', 'square');
        expect(switchClass).toHaveBeenCalledWith(pictureDirective.nativeElement, 'img-round', 'img-square');
    });

    it('should update image source on style change', () => {
        jest.spyOn(pictureDirective, 'setImgSource');
        pictureDirective.onStyleChange('picturesource', 'new-source.jpg', 'old-source.jpg');
        fixture.detectChanges();
        expect(pictureDirective.setImgSource).toHaveBeenCalled();
    });

    it('should call super.onStyleChange for non-picturesource keys', () => {
        // We need to spy on the super.onStyleChange method
        // Since we can't directly spy on the super method, we'll need to use a workaround
        const superOnStyleChangeSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(pictureDirective)), 'onStyleChange');

        pictureDirective.onStyleChange('someOtherKey', 'newValue', 'oldValue');
        fixture.detectChanges();

        expect(superOnStyleChangeSpy).toHaveBeenCalledWith('someOtherKey', 'newValue', 'oldValue');
    });
});
