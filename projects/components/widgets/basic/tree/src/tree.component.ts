import { Attribute, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';


import { APPLY_STYLES_TYPE, getOrderedDataset, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './tree.props';
 
declare const _, $;

const WIDGET_INFO = {widgetType: 'wm-tree', hostClass: 'app-tree'};
const defaultTreeIconClass = 'plus-minus';

const setting = {
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

        }
	},
    check: {
    },
    callback: {
    }
};
   
@Component({ 
    selector: 'ul[wmTree]', 
    templateUrl: './tree.component.html', 
    styleUrls: ['./tree.styles.css'],
    providers: [
        provideAsWidgetRef(TreeComponent)
    ],
    encapsulation: ViewEncapsulation.None
})
export class TreeComponent extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    private nodes: Array<any>;
    private ztreeId;
    private level;
    private orderby;
    private nodelabel;
    private treeicon;
    private nodechildren;
    private nodeclick;
    
    constructor(
        inj: Injector,
        @Attribute('nodelabel.bind') private bindnodelabel,
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
                this.renderTree();
                this.treeicon = nv;
                break;
            case 'nodelabel':
                this.nodelabel = nv;
                this.renderTree();
                break;
            case 'icon':
            case 'orderby':
                this.renderTree();
                break;
            case 'class':
                this.setTreeTemplate(nv);
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
            setting.check["enable"] = false;
        } else if(value === 'Checkbox') {
            setting.check["enable"] = true;
            setting.check["chkStyle"] = 'checkbox';
        } else if (value === 'Radio') {
            setting.check["enable"] = true;
            setting.check["chkStyle"] = 'radio';
            setting.check["radioType"] = "all";
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
    private setNodeLabel(nodes) {
        nodes.map(node => {
            if (node.children) {
                this.setNodeLabel(node.children);
            } if (node.icon && this.nodelabel == 'icon') {
                node.name = node.icon;
            } else {
                return;
            }
        })
    }

    // adds tree icons to the nodes on load of the tree 
    private changeTreeIcons(nv) { 
        let eleClose = $('.app-tree li span.button.switch');

        $(eleClose).map((idx, ele) => {
            $(ele).addClass(nv); 
            $(ele).on("click",function(e) { 
                setTimeout(() => {
                    $(ele).addClass(nv); 
                }, 0);
            });
        })  
    }

    // binds the click event to all nodes to open the child nodes
    public onClick(event, treeId, treeNode, clickFlag) {
        var treeObj = $.fn.zTree.getZTreeObj(`${this.ztreeId}`);
        if (this.nodeclick === 'expand') {
            treeObj.expandNode(treeNode, treeNode.open ? false : true, true, true);
            this.changeTreeIcons(this.treeicon)
        } 
    }

    // space => zTree.expandNode( selectedNode, null, null, null, false ); => onExpand
    // click => {} => onExpand

    // Adds tree icon classes to child nodes when expanded 
    public onExpand(event, treeId, treeNode) {
        let self = this;
        treeNode.children ? treeNode.children.map((el) => {
            if (el.isParent) {
                let ele = $(`#${el.tId}_switch`);
                $(ele).addClass(this.treeicon);
                $(ele).on("click",function(e) { 
                    setTimeout(() => {
                        $(ele).addClass(self.treeicon); 
                    }, 0); 
                });
            } 
        }) : '';
    }

    private extractDepth(obj, depth) {
        if(depth === 0 || typeof obj !== "object") {
            return obj;
        }
        const extractedObj = {};
        for(const [key,value] of Object.entries(obj)) {
            extractedObj[typeof value === 'object' ? key + depth : key] = this.extractDepth(value, depth - 1);
        }
        return extractedObj;
     }
 
    // public depthOfRootNode(ele, depth){
    //     if(depth ===0) {
    //         return ele;
    //     }
    //     ele.map(data => {
    //         if(data.children) {
    //             this.depthOfRootNode(data.children, depth-1)
    //         }
    //     })
    // }

    // sets the node children
    // public setNodeChildren(data, depth) {
    //       if (depth === 0) {
    //         return data;  
    //       }
    //       return data.map(item => {
    //         if (item.children) {
    //            item.children = this.setNodeChildren(item.children, depth - 1);
    //         } 
    //         return item;
    //       });
    // }

    // public filterByDepth(data, depth) {
    //     return data.map(item => {
    //       if (item.children && depth > 1) {
    //         item.children = this.filterByDepth(item.children, depth - 1);
    //       } else {
    //         item.children = undefined;
    //       }
    //       return item;
    //     });
    //   }

    // public beforeClick(treeId, treeNode, clickFlag, event) {
    //     debugger
    //     // check if the clicked element is a tree node and space key was pressed
    //     if (clickFlag === 1 && treeNode.isParent && event.keyCode === 32) {
    //         // manually expand the node
    //         $.fn.zTree.getZTreeObj(treeId).expandNode(treeNode);
    //         // prevent default click event
    //         return false;
    //     }
    //     return true;
    // }

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


    // Renders the tree on to the dom 
    private renderTree() { 
        if(this.nodes) {
            this.nodes = this.modifyObjects(this.nodes);
        }
        if (this.nodelabel && this.nodes) {
            this.setNodeLabel(this.nodes);
        }  

        if (this.nodechildren && this.nodes) {
            // console.log(this.filterByDepth(this.nodes, 2));
            // this.nodes = this.filterByDepth(this.nodes, 2);
            // this.nodes = this.extractDepth(this.nodes, 2);
        }

        setting.view['nodeClasses'] = this.setNodeclasses;

        let zTree = $.fn.zTree.init($("ul[wmTree]"), setting, this.nodes, function(event, treeId, treeNode) { 
            this.ztreeId = treeId; 
        });

        // console.log("$1", $1);

        console.log($.fn);

        $.fn.zTreeKeyboardNavigation(zTree, "ul[wmTree]", null, this.treeicon);

        $("ul[wmTree]")[0].style.cssText += 'list-style-type: none;';

        setting.callback["onClick"] = this.onClick.bind(this);
        setting.callback["onExpand"] = this.onExpand.bind(this);
        // setting.callback["beforeClick"] = this.beforeClick.bind(this);
 
    }

    ngAfterViewInit(): void {    
        setTimeout(() => {
            this.changeTreeIcons(this.treeicon);
        }, 100);
    }
}
