import {Attribute, Component, Inject, Injector, OnInit, Optional, ViewEncapsulation} from '@angular/core';
import { APPLY_STYLES_TYPE, getEvaluatedData, getOrderedDataset, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './tree.props';
import { $parseEvent, getClonedObject } from "@wm/core";
import {isArray, isEmpty, isObject, isString} from "lodash-es";

declare const $;

const WIDGET_INFO = {widgetType: 'wm-tree', hostClass: 'app-tree'};
const defaultTreeIconClass = 'plus-minus';

@Component({
    selector: 'ul[wmTree]',
    templateUrl: './tree.component.html',
    providers: [
        provideAsWidgetRef(TreeComponent)
    ],
    encapsulation: ViewEncapsulation.None
})
export class TreeComponent extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    private nodes: Array<any>;
    private zTreeNodes: Array<any>;
    private level;
    private treeClass;
    private name;
    private zTree;

    public datavalue: string;
    public treeicons: string;
    public selecteditem: any;
    public nodeid: string;
    public nodeaction: string;
    public nodeclick: string;
    public nodelabel: string;
    public nodeicon: string;
    public nodechildren: string;
    public orderby: string;

    private setting = {
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

    constructor(
        inj: Injector,
        @Attribute('datavalue.bind') private binddatavalue,
        @Attribute('nodelabel.bind') private bindnodelabel,
        @Attribute('nodeicon.bind') private bindnodeicon,
        @Attribute('nodechildren.bind') private bindnodechildren,
        @Attribute('nodeid.bind') private bindnodeid,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_INFO, explicitContext);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);

        this.setting.view['nodeClasses']    = this.setNodeClasses;
        this.setting.callback["onClick"]    = this.onClick.bind(this);
        this.setting.callback["onExpand"]   = this.onExpand.bind(this);
        this.setting.callback["onCollapse"] = this.onCollapse.bind(this);
    }

    public onPropertyChange(key: string, nv: any, ov?: any): void {
        switch (key) {
            case 'dataset':
                this.nodes = this.getNodes(nv);
                this.renderTree();
                break;
            case 'levels':
                this.level = nv;
                this.renderTree();
                break;
            case 'nodeicon':
                this.nodeicon = nv;
                this.renderTree();
                break;
            case 'nodelabel':
                this.nodelabel = nv;
                this.renderTree();
                break;
            case 'nodechildren':
                this.nodechildren = nv;
                this.renderTree();
                break;
            case 'orderby':
                this.orderby = nv;
                this.renderTree();
                break;
            case 'treeicons':
                this.treeicons = nv;
                this.renderTree();
                break;
            case 'class':
                this.treeClass = nv;
                this.setTreeTemplate(this.treeClass);
                this.renderTree();
            default:
                super.onPropertyChange(key, nv, ov);
                break;
        }
    }

    // expands the tree nodes if the property is selected.
    private expandTree(level, node, childLevel) {
        node.map(childNode => {
            const children = childNode.children;
            if (children && childLevel < level) {
                childNode.open = true;
                this.expandTree(level, children, childLevel+1);
            } else {
                childLevel = 0;
                return;
            }
        });
    }

    // sets the template for the tree based on the property selected.
    private setTreeTemplate(value) {
        const classList = value.split(" ");
        if (classList.includes('Classic')) {
            this.setting.check["enable"] = false;
        } else if(classList.includes('Checkbox')) {
            this.setting.check["enable"] = true;
            this.setting.check["chkStyle"] = 'checkbox';
        } else if (classList.includes('Radio')) {
            this.setting.check["enable"] = true;
            this.setting.check["chkStyle"] = 'radio';
            this.setting.check["radioType"] = "all";
        }
    }

    // extracts nodes from string format
    private getNodesFromString(value) {
        return value.split(',').map((item) => {
            return {
                'label': item && item.trim()
            };
        });
    }

    // gets the nodes and orders the nodes if required
    private getNodes(newVal) {
        let nodes;
        if (isArray(newVal)) {
            nodes = getOrderedDataset(newVal, this.orderby);
        } else if (isObject(newVal)) {
            nodes = [newVal];
        } else if (isString(newVal) && !isEmpty(newVal)) {
            newVal = newVal.trim();
            if (newVal) {
                nodes = this.getNodesFromString(newVal);
            }
        }
        return nodes;
    }


    // adds class to the nodes inorder to add icons to respective node.
    private setNodeClasses(treeId, treeNode) {
        return treeNode.icon ? {add: [`${treeNode.icon}`]} : '';
    };

    // adds tree icons to the nodes on load of the tree
    private changeTreeIcons(nv) {
        let eleClose = $('ul[name="' + this.name + '"] li span.button.switch');

        $(eleClose).map((idx, ele) => {
            $(ele).addClass(nv);
            $(ele).on("click",function(e) {
                setTimeout(() => {
                    $(ele).addClass(nv);
                }, 0);
            });
        })
    }

    // Returns the node path
    private getPath(treeNode, path) {
        if(treeNode.getParentNode() === null) {
            path = "/" + treeNode.name + path;
        } else {
            path = this.getPath(treeNode.getParentNode(), path) + "/" + treeNode.name;
        }
        return path;
    }

    // binds the click event to all nodes to open the child nodes
    public onClick(event, treeId, treeNode, clickFlag) {
        if(this.nodeclick === "expand") {
            var nodes = this.zTree.getSelectedNodes();
            if (nodes.length>0) {
                this.expandNode(nodes[0], !nodes[0].open, true);
            }
        }
        this.selectNode(event, treeNode);
    }

    // Adds tree icon classes to child nodes when expanded
    public onExpand(event, treeId, treeNode) {
        let self = this;
        let path = this.getPath(treeNode, "");

        const eventParams = {
            '$event'  : event,
            "$item"   : getClonedObject(treeNode.data),
            "$path" : path
        };
        this.invokeEventCallback('expand', eventParams);

        const children = treeNode.children;
        children?.map((el) => {
            if (el.isParent) {
                let ele = $(`#${el.tId}_switch`);
                $(ele).addClass(self.treeicons || defaultTreeIconClass);
                $(ele).on("click", function(e) {
                    setTimeout(() => {
                        $(ele).addClass(self.treeicons || defaultTreeIconClass);
                    }, 0);
                });
            }
        });
    }

    public onCollapse(event, treeId, treeNode) {
        let path = this.getPath(treeNode, "");
        const eventParams = {
            '$event'  : event,
            "$item"   : getClonedObject(treeNode.data),
            "$path" : path
        };
        this.invokeEventCallback('collapse', eventParams);
    }

    // function to support backward compatibility of objects
    private constructZTreeData(data, zTreeData) {
        data.forEach(node => {
            const zNode = {};
            const name = getEvaluatedData(node, {field: this.nodelabel, bindExpression: this.bindnodelabel}, this.viewParent) || node.label;
            const icon = getEvaluatedData(node, {field: this.nodeicon, bindExpression: this.bindnodeicon}, this.viewParent) || node.icon;
            const nodeId = getEvaluatedData(node, {field: this.nodeid, bindExpression: this.bindnodeid}, this.viewParent);
            const children = getEvaluatedData(node, {field: this.nodechildren, bindExpression: this.bindnodechildren}, this.viewParent) || node.children;
            zNode['name'] = name;
            zNode['icon'] = icon;
            zNode['nodeId'] = nodeId;
            zNode['data'] = getClonedObject(node);
            if (isArray(children) && children.length) {
                zNode['children'] = [];
                this.constructZTreeData(children, zNode['children']);
            }
            zTreeData.push(zNode);
        });
    }

    // Renders the tree on to the dom
    public renderTree() {
        this.zTreeNodes = [];
        if(this.nodes?.length) {
            this.nativeElement.setAttribute('id', this.name);
            this.constructZTreeData(this.nodes, this.zTreeNodes);
            if(this.level > 0) {
                this.expandTree(this.level, this.zTreeNodes, 0);
            }
        }
        this.zTree = $.fn.zTree.init($('ul[name="' + this.name + '"]'), this.setting, this.zTreeNodes);
        $.fn.zTreeKeyboardNavigation(this.zTree, $('ul[name="' + this.name + '"]'), null, this.treeicons || defaultTreeIconClass);
        this.postRenderTree();
    }

    private setChecked(zNode, node) {
        node.checked = zNode.checked;
        const children = getEvaluatedData(node, {field: this.nodechildren, bindExpression: this.bindnodechildren}, this.viewParent) || node.children;
        if(children?.length) {
            children.forEach((node, index) => {
                this.setChecked(zNode.children[index], node);
            });
        }
    }

    private selectNode(event, node) {
        const deSelectElm = $(`.app-tree[name=${this.name}] li[treenode].selected`);
        deSelectElm.removeClass('selected');

        if(!node) {
            return;
        }
        const selectElm = $(`#${node.tId}:has(.curSelectedNode)`);
        selectElm.addClass('selected');


        const classList = (this.treeClass || "").split(" ");
        if (classList.includes('Checkbox') || classList.includes('Radio')) {
            this.setChecked(node, node.data);
        }

        const path = this.getPath(node, "");
        this.selecteditem = getClonedObject(node.data) || {};
        this.selecteditem.path = path;

        const eventParams = {
            '$event'  : event,
            "$item"   : getClonedObject(node.data),
            "$path" : path
        };

        //[Todo-CSP]: this data will be dynamic, can not generate function upfront
        const nodeAction = node.data[this.nodeaction || 'action'];
        if (nodeAction) {
            $parseEvent(nodeAction)(this);
        }
        this.invokeEventCallback('select', eventParams);
    }

    private expandNode(node, expand, eventFlag) {
        this.zTree.expandNode(node, expand, false, false, eventFlag);
        const el = $(`#${node.tId}_switch`);
        $(el).addClass(this.treeicons || defaultTreeIconClass);
    }

    private postRenderTree() {
        setTimeout(() => {
            this.changeTreeIcons(this.treeicons || defaultTreeIconClass);

            if (this.datavalue && !this.selecteditem) {
                const nodes = this.zTree.getNodes();
                let node;
                if(nodes.length) {
                    if (this.datavalue === 'FirstNode') {
                        node = nodes[0];
                    }
                    if(this.datavalue === 'LastNode') {
                        node = nodes[nodes.length - 1];
                    }
                }

                if(node) {
                    this.zTree.selectNode(node, false);
                    this.selectNode(undefined, node);
                    this.expandNode(node, true, false);
                }
            }
        }, 200);
    }

    private selectById(value?) {
        const simpleNodes = this.zTree?.transformToArray(this.zTree.getNodes());
        const node = simpleNodes?.find(node => value === node.nodeId);
        if(node) {
            this.zTree.selectNode(node, false);
            this.selectNode(undefined, node);
        }
    }
    private deselectById(value?) {
        this.selecteditem = {};
        this.selectById();
    }
}
