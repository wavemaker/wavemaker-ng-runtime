import { Component, ViewChild } from '@angular/core';
import { TreeComponent } from './tree.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { ComponentFixture } from '@angular/core/testing';
import { compileTestComponent, mockApp } from '../../../../base/src/test/util/component-test-util';
import { AbstractI18nService, App } from '@wm/core';
import { MockAbstractI18nService } from '../../../../base/src/test/util/date-test-util';
import '@ztree/ztree_v3/js/jquery.ztree.all.js';
import "libraries/scripts/tree-keyboard-navigation/keyboard-navigation.js";

const markup = `<ul wmTree name="tree1" class="testClass" height="800" width="200" tabindex="1" show="true"
                collapse.event="tree1Collapse($event, widget, $item, $path)"
                expand.event="tree1Expand($event, widget, $item, $path)"
                fontfamily="Segoe UI" color="#0000FF" fontweight="700" fontstyle="italic" fontsize="20"
                backgroundcolor="#00ff29" backgroundimage="http://www.google.com/doodle4google/images/splashes/featured.png"
                backgroundrepeat="repeat" backgroundposition="left" backgroundsize="200px 200px" backgroundattachment="fixed"
                bordercolor="#d92953" borderstyle="solid" borderwidth="3px 4px 5px 6px"
                padding="3px 4px 5px 6px"></ul>`;

@Component({
    template: markup
})
class TreeWrapperComponent {
    @ViewChild(TreeComponent, /* TODO: add static flag */ { static: true }) wmComponent: TreeComponent;

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
    declarations: [TreeWrapperComponent, TreeComponent],
    imports: [],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
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
// TestBase.verifyPropsInitialization();  /* to be fixed for name issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();


describe('wm-tree: Component Specific Tests', () => {
    let wrapperComponent: TreeWrapperComponent;
    let wmComponent: TreeComponent;
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

    //expect(received).not.toBeNull()
    xit('should call expand tree callback with item, path as data arguments', async () => {
        wmComponent.getWidget().dataset = wrapperComponent.treeDataset;
        jest.spyOn(wrapperComponent, 'tree1Expand');

        // Trigger change detection
        fixture.detectChanges();

        // Wait for the component to stabilize
        await fixture.whenStable();
        // Query for the node icon
        let nodeicon = fixture.debugElement.nativeElement.querySelector('i');

        // Ensure the node icon is not null before interacting
        expect(nodeicon).not.toBeNull();

        if (nodeicon) {
            // Click the node icon
            nodeicon.click();

            // Trigger change detection and wait for stabilization
            fixture.detectChanges();
            await fixture.whenStable();

            // Verify the expand method was called
            expect(wrapperComponent.tree1Expand).toHaveBeenCalledTimes(1);
            expect(wrapperComponent.treePath).toEqual('/item2');
            expect(wrapperComponent.treenodeItem).toBeDefined();
        } else {
            throw new Error('Node icon not found');
        }
    }, 10000); // Increase the timeout if necessary

    // expect(received).not.toBeNull()
    xit('should call collapse tree callback with item, path as data arguments', async () => {
        // Set the dataset
        wmComponent.getWidget().dataset = wrapperComponent.treeDataset;

        // Spy on the collapse method
        jest.spyOn(wrapperComponent, 'tree1Collapse');

        // Trigger change detection
        fixture.detectChanges();

        // Wait for the component to stabilize
        await fixture.whenStable();

        // Query for the node icon
        let nodeicon = fixture.debugElement.nativeElement.querySelector('i');
        expect(nodeicon).not.toBeNull(); // Ensure the element exists before interacting

        if (nodeicon) {
            // Click the node icon
            nodeicon.click();

            // Trigger change detection and wait for stabilization
            fixture.detectChanges();
            await fixture.whenStable();

            // Verify the collapse method was called
            expect(wrapperComponent.tree1Collapse).toHaveBeenCalledTimes(1);
            expect(wrapperComponent.treePath).toEqual('/item2');
            expect(wrapperComponent.treenodeItem).toBeDefined();
        } else {
            throw new Error('Node icon not found');
        }
    }, 10000); // Increase the timeout if necessary

    describe('onPropertyChange', () => {
        beforeEach(() => {
            jest.spyOn(wmComponent, 'renderTree').mockImplementation();
            jest.spyOn((wmComponent as any), 'getNodes').mockReturnValue([]);
            jest.spyOn((wmComponent as any), 'setTreeTemplate').mockImplementation();
        });

        it('should update dataset and render tree', () => {
            const newDataset = [{ label: 'Node 1' }];
            wmComponent.onPropertyChange('dataset', newDataset);
            expect((wmComponent as any).getNodes).toHaveBeenCalledWith(newDataset);
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update levels and render tree', () => {
            wmComponent.onPropertyChange('levels', 2);
            expect((wmComponent as any).level).toBe(2);
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update nodeicon and render tree', () => {
            wmComponent.onPropertyChange('nodeicon', 'icon-class');
            expect(wmComponent.nodeicon).toBe('icon-class');
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update nodelabel and render tree', () => {
            wmComponent.onPropertyChange('nodelabel', 'name');
            expect(wmComponent.nodelabel).toBe('name');
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update nodechildren and render tree', () => {
            wmComponent.onPropertyChange('nodechildren', 'items');
            expect(wmComponent.nodechildren).toBe('items');
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update orderby and render tree', () => {
            wmComponent.onPropertyChange('orderby', 'asc');
            expect(wmComponent.orderby).toBe('asc');
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update treeicons and render tree', () => {
            const newTreeIcons = { folder: 'folder-icon', file: 'file-icon' };
            wmComponent.onPropertyChange('treeicons', newTreeIcons);
            expect(wmComponent.treeicons).toEqual(newTreeIcons);
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should update class, set tree template, and render tree', () => {
            wmComponent.onPropertyChange('class', 'new-tree-class');
            expect((wmComponent as any).treeClass).toBe('new-tree-class');
            expect((wmComponent as any).setTreeTemplate).toHaveBeenCalledWith('new-tree-class');
            expect(wmComponent.renderTree).toHaveBeenCalled();
        });

        it('should call super.onPropertyChange for unknown properties', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'onPropertyChange');
            wmComponent.onPropertyChange('unknownProperty', 'value');
            expect(superSpy).toHaveBeenCalledWith('unknownProperty', 'value', undefined);
        });
    });

    describe('expandTree', () => {
        it('should expand nodes up to the specified level', () => {
            const nodes = [
                {
                    children: [
                        {
                            children: [
                                { children: [] }
                            ]
                        }
                    ]
                }
            ];

            wmComponent['expandTree'](2, nodes, 0);

            expect((nodes[0] as any).open).toBe(true);
            expect((nodes[0].children[0] as any).open).toBe(true);
            expect((nodes[0].children[0].children[0] as any).open).toBeUndefined();
        });

        it('should not expand nodes beyond the specified level', () => {
            const nodes = [
                {
                    children: [
                        {
                            children: [
                                { children: [] }
                            ]
                        }
                    ]
                }
            ];

            wmComponent['expandTree'](1, nodes, 0);

            expect((nodes[0] as any).open).toBe(true);
            expect((nodes[0].children[0] as any).open).toBeUndefined();
        });

    });

    describe('setTreeTemplate', () => {
        beforeEach(() => {
            wmComponent['setting'] = {
                data: {
                    simpleData: {
                        enable: false
                    }
                },
                view: {
                    dblClickExpand: false,
                    fontCss: {
                        'font-awesome': true
                    },
                    switchIcon: {},
                },
                check: {},
                callback: {}
            };
        });

        it('should set Classic template', () => {
            wmComponent['setTreeTemplate']('Classic otherClass');

            expect((wmComponent as any)['setting'].check.enable).toBe(false);
        });

        it('should set Checkbox template', () => {
            wmComponent['setTreeTemplate']('Checkbox otherClass');

            expect((wmComponent as any)['setting'].check.enable).toBe(true);
            expect((wmComponent as any)['setting'].check.chkStyle).toBe('checkbox');
        });

        it('should set Radio template', () => {
            wmComponent['setTreeTemplate']('Radio otherClass');

            expect((wmComponent as any)['setting'].check.enable).toBe(true);
            expect((wmComponent as any)['setting'].check.chkStyle).toBe('radio');
            expect((wmComponent as any)['setting'].check.radioType).toBe('all');
        });

        it('should not change settings for unknown template', () => {
            wmComponent['setTreeTemplate']('Unknown otherClass');

            expect((wmComponent as any)['setting'].check.enable).toBeUndefined();
            expect((wmComponent as any)['setting'].check.chkStyle).toBeUndefined();
            expect((wmComponent as any)['setting'].check.radioType).toBeUndefined();
        });
    });

    describe('getPath', () => {
        it('should return the correct path for a leaf node', () => {
            const leafNode = {
                name: 'leaf',
                getParentNode: () => ({
                    name: 'parent',
                    getParentNode: () => ({
                        name: 'grandparent',
                        getParentNode: () => null
                    })
                })
            };

            const path = wmComponent['getPath'](leafNode, '');
            expect(path).toBe('/grandparent/parent/leaf');
        });

        it('should return the correct path for a root node', () => {
            const rootNode = {
                name: 'root',
                getParentNode: () => null
            };

            const path = wmComponent['getPath'](rootNode, '');
            expect(path).toBe('/root');
        });
    });


    describe('onClick', () => {
        let mockEvent: any;
        let mockTreeNode: any;

        beforeEach(() => {
            mockEvent = { stopPropagation: jest.fn() };
            mockTreeNode = { name: 'testNode', open: false };
            (wmComponent as any).zTree = {
                getSelectedNodes: jest.fn().mockReturnValue([mockTreeNode]),
                expandNode: jest.fn()
            } as any;
            (wmComponent as any).selectNode = jest.fn();
            (wmComponent as any).expandNode = jest.fn();
        });

        it('should expand node when nodeclick is "expand"', () => {
            wmComponent.nodeclick = 'expand';
            wmComponent.onClick(mockEvent, 'treeId', mockTreeNode, true);

            expect((wmComponent as any).zTree.getSelectedNodes).toHaveBeenCalled();
            expect((wmComponent as any).expandNode).toHaveBeenCalledWith(mockTreeNode, true, true);
            expect((wmComponent as any).selectNode).toHaveBeenCalledWith(mockEvent, mockTreeNode);
        });

        it('should collapse node when nodeclick is "expand" and node is already open', () => {
            wmComponent.nodeclick = 'expand';
            mockTreeNode.open = true;
            wmComponent.onClick(mockEvent, 'treeId', mockTreeNode, true);

            expect((wmComponent as any).zTree.getSelectedNodes).toHaveBeenCalled();
            expect((wmComponent as any).expandNode).toHaveBeenCalledWith(mockTreeNode, false, true);
            expect((wmComponent as any).selectNode).toHaveBeenCalledWith(mockEvent, mockTreeNode);
        });

        it('should not expand node when nodeclick is not "expand"', () => {
            wmComponent.nodeclick = 'select';
            wmComponent.onClick(mockEvent, 'treeId', mockTreeNode, true);

            expect((wmComponent as any).zTree.getSelectedNodes).not.toHaveBeenCalled();
            expect((wmComponent as any).expandNode).not.toHaveBeenCalled();
            expect((wmComponent as any).selectNode).toHaveBeenCalledWith(mockEvent, mockTreeNode);
        });

        it('should not expand node when no nodes are selected', () => {
            wmComponent.nodeclick = 'expand';
            (wmComponent as any).zTree.getSelectedNodes.mockReturnValue([]);
            wmComponent.onClick(mockEvent, 'treeId', mockTreeNode, true);

            expect((wmComponent as any).zTree.getSelectedNodes).toHaveBeenCalled();
            expect((wmComponent as any).expandNode).not.toHaveBeenCalled();
            expect((wmComponent as any).selectNode).toHaveBeenCalledWith(mockEvent, mockTreeNode);
        });
    });
});
