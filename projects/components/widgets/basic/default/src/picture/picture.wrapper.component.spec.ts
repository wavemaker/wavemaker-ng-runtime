import { Component, ViewChild } from "@angular/core";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { PictureDirective } from "./picture.directive";
import { App } from "@wm/core";
import { ImagePipe } from "@wm/components/base";

let mockApp = {
    subscribe: () => { return () => { } }
};

const markup = `<img wmPicture #wm_picture="wmPicture" [attr.aria-label]="wm_picture.hint || 'Picture content'" hint="Picture content" name="picture1" tabindex="0" picturesource="source.jpg" encodeurl="true" pictureplaceholder="placeholder.jpg">`;

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