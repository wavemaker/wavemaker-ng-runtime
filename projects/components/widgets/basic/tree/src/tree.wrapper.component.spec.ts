import { Component, ViewChild } from '@angular/core';
import { TreeDirective } from './tree.directive';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { ComponentFixture } from '@angular/core/testing';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { RedrawableDirective } from '@wm/components/base';
import { App } from '@wm/core';

let mockApp = {};

const markup = `<div wmTree redrawable name="tree1" class="testClass" height="800" width="200" tabindex="1" show="true"
                fontfamily="Segoe UI" color="#0000FF" fontweight="700" fontstyle="italic" fontsize="20"
                backgroundcolor="#00ff29" backgroundimage="http://www.google.com/doodle4google/images/splashes/featured.png"
                backgroundrepeat="repeat" backgroundposition="left" backgroundsize="200px 200px" backgroundattachment="fixed"
                bordercolor="#d92953" borderstyle="solid" borderwidth="3px 4px 5px 6px"
                padding="3px 4px 5px 6px"></div>`;

@Component({
    template: markup
})
class TreeWrapperComponent {
    @ViewChild(TreeDirective) wmComponent: TreeDirective;
}

const testModuleDef: ITestModuleDef = {
    declarations: [TreeWrapperComponent, TreeDirective, RedrawableDirective],
    imports: [],
    providers: [
        { provide: App, useValue: mockApp }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-tree',
    widgetSelector: '[wmTree]',
    testModuleDef: testModuleDef,
    testComponent: TreeWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();


describe('wm-tree: Component Specific Tests', () => {
    let wrapperComponent: TreeWrapperComponent;
    let wmComponent: TreeDirective;
    let fixture: ComponentFixture<TreeWrapperComponent>;
    beforeEach(async () => {
        fixture = compileTestComponent(testModuleDef, TreeWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    });
    it('should create tree component', () => {
        expect(wrapperComponent).toBeTruthy();
    });
});
