import { Attribute, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { APPLY_STYLES_TYPE, getEvaluatedData, getOrderedDataset, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './tree.props';
import { getClonedObject } from "@wm/core";

declare const _, $;

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

    public selecteditem: any;
    public nodeid: string;
    private nodes;
    private level;
    private orderby;
    private nodelabel;
    private treeicon;
    private nodechildren;
    private nodeclick;
    private treeClass;
    private nodeicon;
    private name;
    private datavalue;

    private setting = {
        data: {
            simpleData: {
                enable: false
            },
            key: {
                children: 'children',
                name: 'label'
            }
        },
        view: {
            dblClickExpand: false,
            fontCss: {
                'font-awesome': true
              },
            switchIcon: {

            },
        },
        check: {
        },
        callback: {
        }
    };

    constructor(
        inj: Injector,
        @Attribute('nodeid.bind') private bindnodeid
    ) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    public onPropertyChange(key: string, nv: any, ov?: any): void {
        switch (key) {
            case 'dataset':
                this.nodes = this.getNodes(nv);
                if(this.level > 0) {
                    this.expandTree(this.level, this.nodes, 0);
                }
                this.renderTree();
                break;
            case 'levels':
                if (nv > 0) {
                    this.level = nv;
                }
                this.renderTree();
                break;
            case 'treeicons':
                this.treeicon = nv;
                this.renderTree();
                break;
            case 'nodelabel':
                this.setting.data.key.name = this.labelKey;
                this.renderTree();
                break;
            case 'nodechildren':
                this.setting.data.key.children = this.childrenKey;
                this.renderTree();
                break;
            case 'nodeicon':
                this.nodeicon = this.iconKey;
                this.renderTree();
                break;
            case 'orderby':
                this.renderTree();
                break;
            case 'class':
                this.treeClass = nv;
                this.renderTree();
                break;
            default:
                super.onPropertyChange(key, nv, ov);
                break;
        }
    }

    // expands the tree nodes if the property is selected.
    private expandTree(level, node, childLevel) {
        node.map(childNode => {
            const children = this.getChildren(childNode);
            if (children && !("open" in childNode) && childLevel < level) {
                childNode["open"] = true;
                this.expandTree(level, children, childLevel+1);
            } else {
                childLevel = 0;
                return;
            }
        });
    }

    // sets the template for the tree based on the property selected.
    private setTreeTemplate(value) {
        if (value === 'Classic') {
            this.setting.check["enable"] = false;
        } else if(value === 'Checkbox') {
            this.setting.check["enable"] = true;
            this.setting.check["chkStyle"] = 'checkbox';
        } else if (value === 'Radio') {
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
        if (_.isArray(newVal)) {
            nodes = getOrderedDataset(newVal, this.orderby);
        } else if (_.isObject(newVal)) {
            nodes = [newVal];
        } else if (_.isString(newVal) && !_.isEmpty(newVal)) {
            newVal = newVal.trim();
            if (newVal) {
                nodes = this.getNodesFromString(newVal);
            }
        }
        return nodes;
    }


    // adds class to the nodes inorder to add icons to respective node.
    private setNodeclasses(treeId, treeNode) {
        return treeNode.icon ? {add: [`${treeNode.icon}`]} : '';
    };

    // Sets the node label with any icon if bound to
    private setNodeData(nodes, depth, level, parentNode, type) {
        if(depth === 0) {
            nodes.map(node => {
                const children = this.getChildren(node);
                if (children) {
                    this.setNodeData(children, depth, level , parentNode, type);
                }
                if (node.icon && this.nodelabel == 'icon') {
                    node[type] = node.icon;
                } else if(node.name && this.nodelabel == 'name') {
                    node[type] = node.name;
                } else {
                    return;
                }
            })
        } else {
            nodes.map(node => {
                const children = this.getChildren(node);
                if (children && level > 1) {
                    if(depth === level) {
                        parentNode = node;
                    }
                    this.setNodeData(children, depth, level - 1, parentNode, type);
                }
                if (level === 1 && (type === "name" ? this.nodelabel.includes("label") || this.nodelabel.includes("name"): this.nodeicon.includes("label") || this.nodeicon.includes("name") )) {
                    parentNode[type] = node.name || node.label;
                    return
                } else if(level === 1 && (node.icon !== undefined) && (type === "name" ? this.nodelabel.includes("icon") : this.nodeicon.includes("icon"))) {
                    parentNode[type] = node.icon;
                    return;
                } else {
                    return;
                }
            })
        }
    }

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

    private getPath(treeNode, path) {
        if(treeNode.getParentNode() === null) {
            path = "/" + treeNode[this.labelKey] + path;
        } else {
            path = this.getPath(treeNode.getParentNode(), path) + "/" + treeNode[this.labelKey];
        }
        return path;
    }

    // binds the click event to all nodes to open the child nodes
    public onClick(event, treeId, treeNode, clickFlag) {
        if(this.nodeclick === "expand") {
            var nodes = this.treeObj.getSelectedNodes();
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
            "$item"   : treeNode,
            "$path" : path
        };
        this.invokeEventCallback('expand', eventParams);

        const children = this.getChildren(treeNode);
        children?.map((el) => {
            if (el.isParent) {
                let ele = $(`#${el.tId}_switch`);
                $(ele).addClass(self.treeicon || defaultTreeIconClass);
                $(ele).on("click", function(e) {
                    setTimeout(() => {
                        $(ele).addClass(self.treeicon || defaultTreeIconClass);
                    }, 0);
                });
            }
        });
    }

    public onCollapse(event, treeId, treeNode) {
        let path = this.getPath(treeNode, "");
        const eventParams = {
            '$event'  : event,
            "$item"   : treeNode,
            "$path" : path
        };
        this.invokeEventCallback('collapse', eventParams);
    }

    private getChildren(node) {
        return node[this.childrenKey];
    }
    get childrenKey() {
        if(!this.nodechildren) {
            return 'children';
        }
        const depth = this.countDepth(this.nodechildren);
        return depth ? this.nodechildren.split('.').pop() : this.nodechildren;
    }
    get labelKey() {
        if(!this.nodelabel) {
            return 'label';
        }
        const depth = this.countDepth(this.nodelabel);
        return depth ? this.nodelabel.split('.').pop() : this.nodelabel;
    }
    get iconKey() {
        if(!this.nodeicon) {
            return 'icon';
        }
        const depth = this.countDepth(this.nodeicon);
        return depth ? this.nodeicon.split('.').pop() : this.nodeicon;
    }

    get treeObj(){
        return $.fn.zTree.getZTreeObj(`${this.name}`)
    }

    // function to support backward compatibility of objects
    private modifyObjects(array) {
        array.forEach(obj => {
          obj.icon = obj[this.nodeicon];
          const children = this.getChildren(obj);
          if (children?.length) {
            this.modifyObjects(children);
          }
        });
      }

    // sets the node children property to parent nodes
    private setNodeChildren(nodes, depth, level, parentNode) {
        if (depth <= 0) {
          return nodes;
        }
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if(depth === level) {
            parentNode  = nodes[i];
          }
          const children = this.getChildren(node);
          if (children?.length) {
            if (level === 1) {
                parentNode[this.childrenKey] = children.map(child => ({ [this.labelKey]: child[this.labelKey], [this.childrenKey]: this.getChildren(child), icon: child[this.iconKey] }));
                return;
            } else {
              this.setNodeChildren(children, depth ,level - 1, parentNode);
            }
          }
        }

        return nodes;
      }

    private countDepth(str) {
        const regex = /\[.*?\]/g;
        let matches = str.match(regex);
        let count = 1;

        if(matches === null) return count;

        for (let match of matches) {
          count++;
        }

        return count;
      }


    // Renders the tree on to the dom
    public renderTree() {
        if(this.nodes) {
            this.nativeElement.setAttribute('id', this.name);
             if(this.nodeicon && this.nodeicon !== 'icon') {
                this.modifyObjects(this.nodes);
            }
            this.setTreeTemplate(this.treeClass);

            if (this.nodelabel) {
                let depth =0;
                if(this.nodelabel.includes("children")) {
                    depth = this.countDepth(this.nodelabel);
                }
                this.setNodeData(this.nodes, depth, depth, null, "name");
            }
            if(this.nodeicon)  {
                let depth =0;
                if(this.nodeicon.includes("children")) {
                    depth = this.countDepth(this.nodeicon);
                }
                this.setNodeData(this.nodes, depth, depth, null, "icon");
            }

            if (this.nodechildren) {
                let depth = this.countDepth(this.nodechildren);
                if(depth > 1) {
                    this.nodes = this.setNodeChildren(this.nodes, depth, depth, null);
                }
            }
        }


        this.setting.view['nodeClasses'] = this.setNodeclasses;
        this.setting.callback["onClick"] = this.onClick.bind(this);
        this.setting.callback["onExpand"] = this.onExpand.bind(this);
        this.setting.callback["onCollapse"] = this.onCollapse.bind(this);

        let zTree = $.fn.zTree.init($('ul[name="' + this.name + '"]'), this.setting, this.nodes);

        $.fn.zTreeKeyboardNavigation(zTree, $('ul[name="' + this.name + '"]'), null, this.treeicon || defaultTreeIconClass);
        this.postRenderTree();
    }

    private selectNode(event, node) {
        const deSelectElm = $(`.app-tree[name=${this.name}] li[treenode].selected`);
        deSelectElm.removeClass('selected');

        if(!node) {
            return;
        }
        const selectElm = $(`#${node.tId}:has(.curSelectedNode)`);
        selectElm.addClass('selected');

        const path = this.getPath(node, "");
        this.selecteditem = getClonedObject(node) || {};
        this.selecteditem.path = path;

        const eventParams = {
            '$event'  : event,
            "$item"   : node,
            "$path" : path
        };
        this.invokeEventCallback('select', eventParams);
    }

    private expandNode(node, expand, eventFlag) {
        this.treeObj.expandNode(node, expand, false, false, eventFlag);
        const el = $(`#${node.tId}_switch`);
        $(el).addClass(this.treeicon || defaultTreeIconClass);
    }

    private postRenderTree() {
        setTimeout(() => {
            this.changeTreeIcons(this.treeicon || defaultTreeIconClass);

            if (this.datavalue && !this.selecteditem) {
                const nodes = this.treeObj.getNodes();
                let node;
                if(nodes.length) {
                    if (this.datavalue === 'FirstNode') {
                        node = nodes[0];
                    }
                    if(this.datavalue === 'LastNode') {
                        node = nodes[nodes.length - 1]
                    }
                }

                if(node) {
                    this.treeObj.selectNode(node, false);
                    this.selectNode(undefined, node);
                    this.expandNode(node, true, false);
                }
            }
        }, 200);
    }

    private selectById(value?) {
        const simpleNodes = this.treeObj.transformToArray(this.treeObj.getNodes());
        const node = simpleNodes.find(node => value === getEvaluatedData(node, {field: this.nodeid, bindExpression: this.bindnodeid}, this.viewParent));
        if(node) {
            this.treeObj.selectNode(node, false);
            this.selectNode(undefined, node);
        }
    }
    private deselectById(value?) {
        this.selecteditem = {};
        this.selectById();
    }
}
