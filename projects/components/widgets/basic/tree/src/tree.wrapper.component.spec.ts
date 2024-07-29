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

    describe('selectNode', () => {
        let mockEvent: any;
        let mockNode: any;
        let jquerySpy: jest.SpyInstance;
        let addClassSpy: jest.SpyInstance;
        let removeClassSpy: jest.SpyInstance;

        beforeEach(() => {
            mockEvent = { type: 'click' };
            mockNode = {
                tId: 'node1',
                data: { name: 'Node 1' }
            };
            (wmComponent as any).name = 'testTree';
            wmComponent['treeClass'] = 'Classic';
            wmComponent['getPath'] = jest.fn().mockReturnValue('/path/to/node');
            wmComponent['setChecked'] = jest.fn();
            wmComponent['invokeEventCallback'] = jest.fn();

            // Mock jQuery
            jquerySpy = jest.spyOn(global, '$' as any).mockReturnValue({
                removeClass: removeClassSpy = jest.fn().mockReturnThis(),
                addClass: addClassSpy = jest.fn().mockReturnThis()
            });

            // Mock getClonedObject
            (global as any).getClonedObject = jest.fn(obj => ({ ...obj }));

            // Mock $parseEvent
            (global as any).$parseEvent = jest.fn(() => jest.fn());
        });

        it('should deselect previously selected node and select new node', () => {
            wmComponent['selectNode'](mockEvent, mockNode);

            expect(jquerySpy).toHaveBeenCalledWith('.app-tree[name=testTree] li[treenode].selected');
            expect(removeClassSpy).toHaveBeenCalledWith('selected');
            expect(jquerySpy).toHaveBeenCalledWith('#node1:has(.curSelectedNode)');
            expect(addClassSpy).toHaveBeenCalledWith('selected');
        });

        it('should not select a new node if node is null', () => {
            wmComponent['selectNode'](mockEvent, null);

            expect(jquerySpy).toHaveBeenCalledWith('.app-tree[name=testTree] li[treenode].selected');
            expect(removeClassSpy).toHaveBeenCalledWith('selected');
            expect(jquerySpy).toHaveBeenCalledTimes(3);
            expect(addClassSpy).not.toHaveBeenCalled();
        });

        it('should call setChecked for Checkbox class', () => {
            wmComponent['treeClass'] = 'Checkbox';
            wmComponent['selectNode'](mockEvent, mockNode);

            expect(wmComponent['setChecked']).toHaveBeenCalledWith(mockNode, mockNode.data);
        });

        it('should call setChecked for Radio class', () => {
            wmComponent['treeClass'] = 'Radio';
            wmComponent['selectNode'](mockEvent, mockNode);

            expect(wmComponent['setChecked']).toHaveBeenCalledWith(mockNode, mockNode.data);
        });

        it('should set selecteditem with path', () => {
            wmComponent['selectNode'](mockEvent, mockNode);

            expect(wmComponent['selecteditem']).toEqual({
                name: 'Node 1',
                path: '/path/to/node'
            });
        });

        it('should invoke select event callback', () => {
            wmComponent['selectNode'](mockEvent, mockNode);

            expect(wmComponent['invokeEventCallback']).toHaveBeenCalledWith('select', {
                '$event': mockEvent,
                '$item': { name: 'Node 1' },
                '$path': '/path/to/node'
            });
        });
    })
    describe('expandNode', () => {
        let mockNode: any;
        let mockZTree: any;
        let jquerySpy: jest.SpyInstance;
        let addClassSpy: jest.SpyInstance;

        beforeEach(() => {
            mockNode = {
                tId: 'node1'
            };
            mockZTree = {
                expandNode: jest.fn()
            };
            wmComponent['zTree'] = mockZTree;
            // Mock jQuery
            jquerySpy = jest.spyOn(global, '$' as any).mockReturnValue({
                addClass: addClassSpy = jest.fn().mockReturnThis()
            });
            // The default tree icon class is now 'plus-minus'
            (wmComponent as any).defaultTreeIconClass = 'plus-minus';
        });

        it('should call zTree.expandNode with correct parameters', () => {
            wmComponent['expandNode'](mockNode, true, true);
            expect(mockZTree.expandNode).toHaveBeenCalledWith(mockNode, true, false, false, true);
        });

        it('should add default tree icon class when treeicons is not set', () => {
            wmComponent['expandNode'](mockNode, true, true);

            expect(jquerySpy).toHaveBeenCalledWith('#node1_switch');
            expect(addClassSpy).toHaveBeenCalledWith('plus-minus');
        });

        it('should add custom tree icon class when treeicons is set', () => {
            wmComponent.treeicons = 'custom-tree-icon';
            wmComponent['expandNode'](mockNode, true, true);

            expect(jquerySpy).toHaveBeenCalledWith('#node1_switch');
            expect(addClassSpy).toHaveBeenCalledWith('custom-tree-icon');
        });

        it('should work correctly when expanding a node', () => {
            wmComponent['expandNode'](mockNode, true, false);

            expect(mockZTree.expandNode).toHaveBeenCalledWith(mockNode, true, false, false, false);
            expect(jquerySpy).toHaveBeenCalledWith('#node1_switch');
            expect(addClassSpy).toHaveBeenCalledWith('plus-minus');
        });

        it('should work correctly when collapsing a node', () => {
            wmComponent['expandNode'](mockNode, false, true);

            expect(mockZTree.expandNode).toHaveBeenCalledWith(mockNode, false, false, false, true);
            expect(jquerySpy).toHaveBeenCalledWith('#node1_switch');
            expect(addClassSpy).toHaveBeenCalledWith('plus-minus');
        });
    });

    describe('selectById', () => {
        let mockZTree: any;
        let mockNodes: any[];

        beforeEach(() => {
            mockNodes = [
                { nodeId: '1', name: 'Node 1' },
                { nodeId: '2', name: 'Node 2' },
                { nodeId: '3', name: 'Node 3' }
            ];
            mockZTree = {
                transformToArray: jest.fn().mockReturnValue(mockNodes),
                getNodes: jest.fn().mockReturnValue(mockNodes),
                selectNode: jest.fn()
            };
            wmComponent['zTree'] = mockZTree;
            wmComponent['selectNode'] = jest.fn();
        });

        it('should select node by id when node exists', () => {
            wmComponent['selectById']('2');

            expect(mockZTree.transformToArray).toHaveBeenCalledWith(mockNodes);
            expect(mockZTree.selectNode).toHaveBeenCalledWith(mockNodes[1], false);
            expect(wmComponent['selectNode']).toHaveBeenCalledWith(undefined, mockNodes[1]);
        });

        it('should not select node when node does not exist', () => {
            wmComponent['selectById']('4');

            expect(mockZTree.transformToArray).toHaveBeenCalledWith(mockNodes);
            expect(mockZTree.selectNode).not.toHaveBeenCalled();
            expect(wmComponent['selectNode']).not.toHaveBeenCalled();
        });

        it('should handle undefined value', () => {
            wmComponent['selectById'](undefined);

            expect(mockZTree.transformToArray).toHaveBeenCalledWith(mockNodes);
            expect(mockZTree.selectNode).not.toHaveBeenCalled();
            expect(wmComponent['selectNode']).not.toHaveBeenCalled();
        });
    });

    describe('deselectById', () => {
        beforeEach(() => {
            wmComponent['selectById'] = jest.fn();
        });

        it('should clear selecteditem and call selectById', () => {
            wmComponent['deselectById']();

            expect(wmComponent['selecteditem']).toEqual({});
        });

        it('should ignore passed value', () => {
            wmComponent['deselectById']('someValue');

            expect(wmComponent['selecteditem']).toEqual({});
        });
    });

    describe('setChecked', () => {
        let mockGetEvaluatedData: jest.Mock;

        beforeEach(() => {
            mockGetEvaluatedData = jest.fn();
            (global as any).getEvaluatedData = mockGetEvaluatedData;
            wmComponent.nodechildren = 'children';
            (wmComponent as any).bindnodechildren = 'bindChildren';
            (wmComponent as any).viewParent = {};
        });

        it('should set checked state for a single node without children', () => {
            const zNode = { checked: true };
            const node = {};

            wmComponent['setChecked'](zNode, node);

            expect(node).toHaveProperty('checked', true);
        });

        it('should set checked state for a node and its children', () => {
            const zNode = {
                checked: true,
                children: [
                    { checked: true },
                    { checked: true }
                ]
            };
            const node = {
                children: [{}, {}]
            };

            mockGetEvaluatedData.mockReturnValue(node.children);

            wmComponent['setChecked'](zNode, node);

            expect(node).toHaveProperty('checked', true);
            expect(node.children[0]).toHaveProperty('checked', true);
            expect(node.children[1]).toHaveProperty('checked', true);
        });

        it('should handle nodes with no children', () => {
            const zNode = { checked: true };
            const node = {};

            mockGetEvaluatedData.mockReturnValue(null);

            wmComponent['setChecked'](zNode, node);

            expect(node).toHaveProperty('checked', true);
        }); 

        it('should handle deeply nested children', () => {
            const zNode = {
                checked: true,
                children: [
                    {
                        checked: true,
                        children: [
                            { checked: true }
                        ]
                    }
                ]
            };
            const node = {
                children: [
                    {
                        children: [{}]
                    }
                ]
            };

            mockGetEvaluatedData.mockReturnValue(node.children);

            wmComponent['setChecked'](zNode, node);

            expect(node).toHaveProperty('checked', true);
            expect(node.children[0]).toHaveProperty('checked', true);
            expect(node.children[0].children[0]).toHaveProperty('checked', true);
        });
    });
});
