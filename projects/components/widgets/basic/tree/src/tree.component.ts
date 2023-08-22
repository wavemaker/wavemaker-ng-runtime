import {Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';


import { APPLY_STYLES_TYPE, getOrderedDataset, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './tree.props';

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

    private setting = {
        data: {
            simpleData: {
                enable: true
            },
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
        inj: Injector
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
                break;
            case 'treeicons':
                this.treeicon = nv;
                break;
            case 'nodelabel':
                this.nodelabel = nv;
                break;
            case 'icon':
                this.nodeicon = nv;
            case 'orderby':
                this.renderTree();
                break;
            case 'class':
                this.treeClass = nv;
                break;
            default:
                super.onPropertyChange(key, nv, ov);
                break;
        }
    }

    // expands the tree nodes if the property is selected.
    private expandTree(level, node, childLevel) {
        node.map(childNode => {
            if ("children" in childNode && !("open" in childNode) && childLevel < level) {
                childNode["open"] = true;
                this.expandTree(level, childNode.children, childLevel+1);
            } else {
                childLevel = 0;
                return;
            }
        })
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
                'name': item && item.trim()
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
                if (node.children) {
                    this.setNodeData(node.children, depth, level , parentNode, type);
                } if (node.icon && this.nodelabel == 'icon') {
                    node[type] = node.icon;
                } else if(node.name && this.nodelabel == 'name') {
                    node[type] = node.name;
                } else {
                    return;
                }
            })
        } else {
            nodes.map(node => {
                if (node.children && level > 1) {
                    if(depth === level) {
                        parentNode = node;
                    }
                    this.setNodeData(node.children, depth, level - 1, parentNode, type);
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
            path = "/" + treeNode.name + path;
        } else {
            path = this.getPath(treeNode.getParentNode(), path) + "/" + treeNode.name;
        }
        return path;
    }

    // binds the click event to all nodes to open the child nodes
    public onClick(event, treeId, treeNode, clickFlag) {
        var treeObj = $.fn.zTree.getZTreeObj(`${this.name}`);
        let path = this.getPath(treeNode, "");

        const eventParams = {
            '$event'  : event,
            "$item"   : treeNode,
            "$path" : path
        };
        this.invokeEventCallback('select', eventParams);
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
        treeNode.children ? treeNode.children.map((el) => {
            if (el.isParent) {
                let ele = $(`#${el.tId}_switch`);
                $(ele).addClass(self.treeicon || defaultTreeIconClass);
                $(ele).on("click", function(e) {
                    setTimeout(() => {
                        $(ele).addClass(self.treeicon || defaultTreeIconClass);
                    }, 0);
                });
            }
        }) : '';
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

    // function to support backward compatibility of objects
    public modifyObjects(array) {
        array.forEach(obj => {
          if (obj.label !== undefined) {
            obj.name = obj.label;
            delete obj.label;
          }
          if (obj.children !== undefined) {
            this.modifyObjects(obj.children);
          }
        });
        return array;
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
          if (node.children && node.children.length > 0) {
            if (level === 1) {
                parentNode.children = node.children.map(child => ({ name: child.name, children: child?.children }));
                return;
            } else {
              this.setNodeChildren(node.children, depth ,level - 1, parentNode);
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
        console.log(this.nodes, 'this.nodes');
        if(this.nodes) {
            this.nativeElement.setAttribute('id', this.name);
            this.nodes = this.modifyObjects(this.nodes);
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

    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.changeTreeIcons(this.treeicon || defaultTreeIconClass);
        }, 200);
    }
}
