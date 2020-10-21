import { Component, ViewChild } from '@angular/core';
import { TreeDirective } from './tree.directive';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { ComponentFixture } from '@angular/core/testing';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { RedrawableDirective } from '@wm/components/base';
import { App } from '@wm/core';

let mockApp = {};

const markup = `<div wmTree redrawable name="tree1" class="testClass" height="800" width="200" tabindex="1" show="true"
                collapse.event="tree1Collapse($event, widget, $item, $path)"
                expand.event="tree1Expand($event, widget, $item, $path)"
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

    treenodeItem;
    treePath;

    treeDataset = [

        {
            "label": "item2",
            "icon": "glyphicon glyphicon-music",
            "children": [
                {
                    "label": "item2.1",
                    "icon": "glyphicon glyphicon-bookmark",
                    "children": [
                        {
                            "label": "item2.1.1",
                            "icon": "glyphicon glyphicon-headphones",
                            "children": [
                                {
                                    "label": "item2.1.1.1",
                                    "icon": "glyphicon glyphicon-euro"
                                }
                            ]
                        }
                    ]
                }
            ]
        },

    ];


    tree1Collapse($event, widget, $item, $path) {
        this.treenodeItem = $item;
        this.treePath = $path;
        console.log($item, $path);
    }

    tree1Expand($event, widget, $item, $path) {
        this.treenodeItem = $item;
        this.treePath = $path;
        console.log($item, $path);
    }
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
        expect(wmComponent).toBeTruthy();
    });

    it('should call exapand tree callback with item, path as data arguments ', async (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.treeDataset;
        spyOn(wrapperComponent, 'tree1Expand').and.callThrough();
        let nodeicon = fixture.debugElement.nativeElement.querySelector('i');
        setTimeout(() => {
            nodeicon.click();
            fixture.whenStable().then(() => {
                expect(wrapperComponent.tree1Expand).toHaveBeenCalledTimes(1);
                expect(wrapperComponent.treePath).toEqual('/item2');
                expect(wrapperComponent.treenodeItem).toBeDefined();
                done();
            });
        }, 100);

    });

    it('should call collapse tree callback with item, path as data arguments',async (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.treeDataset;
        spyOn(wrapperComponent, 'tree1Collapse').and.callThrough();
        let nodeicon = fixture.debugElement.nativeElement.querySelector('i');
        setTimeout(() => {
            nodeicon.click();
            nodeicon.click();
            fixture.whenStable().then(() => {
                expect(wrapperComponent.tree1Collapse).toHaveBeenCalledTimes(1);
                expect(wrapperComponent.treePath).toEqual('/item2');
                expect(wrapperComponent.treenodeItem).toBeDefined();
                done();
            });
        }, 100);
    });

});
