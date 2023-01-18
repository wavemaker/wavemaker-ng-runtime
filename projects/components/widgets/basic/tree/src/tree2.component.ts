import { Attribute, Component, Injector, OnInit } from '@angular/core';


import { APPLY_STYLES_TYPE, getOrderedDataset, getEvaluatedData, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './tree.props';

declare const _, $;

const WIDGET_INFO = {widgetType: 'wm-tree', hostClass: 'app-tree'};
const defaultTreeIconClass = 'plus-minus';
const ICON_CLASSES = {
    'folder': {
        'expanded' : 'wi-folder-open',
        'collapsed': 'wi-folder'
    },
    'circle-plus-minus': {
        'expanded' : 'wi-remove-circle-outline',
        'collapsed': 'wi-add-circle-outline'
    },
    'chevron': {
        'expanded' : 'wi-keyboard-arrow-down',
        'collapsed': 'wi-keyboard-arrow-right'
    },
    'menu': {
        'expanded' : 'wi-arrow-down',
        'collapsed': 'wi-arrow-right'
    },
    'triangle': {
        'expanded' : 'wi-arrow-drop-down-circle',
        'collapsed': 'wi-play-circle-filled'
    },
    'expand-collapse': {
        'expanded' : 'wi-expand-less',
        'collapsed': 'wi-expand-more'
    },
    'plus-minus': {
        'expanded' : 'wi-minus',
        'collapsed': 'wi-plus'
    }
};


const setting = {
    data: {
        simpleData: {
            enable: true
        },
    },
    view: {
	}
};

@Component({
    selector: 'ul[wmTree]',
    templateUrl: './tree.component.html',
    styleUrls: ['../../../../../../node_modules/@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css'],
    providers: [
        provideAsWidgetRef(TreeComponent)
    ],

})
export class TreeComponent extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    private nodes: Array<any>;
    private level;
    private orderby;
    private nodelabel;

    constructor(
        inj: Injector,
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
                this.changeTreeIcons(nv, ov);
                break;
            case 'nodelabel':
                this.formatData(key, nv, this.nodes);
                this.renderTree();
                break;
            case 'icon':
            case 'orderby':
                this.renderTree();
                break;
            default:
                super.onPropertyChange(key, nv, ov);
                break;
        }
    }

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

    private getNodesFromString(value) {
        return value.split(',').map((item) => {
            return {
                'name': item && item.trim()
            };
        });
    }

    private getNodes(newVal) {
        let nodes;
        if(_.isArray(newVal)) {
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

    private formatData(key, nv, nodes) {
        debugger
    }

    private changeTreeIcons(nv, ov) {
        const $el = $(this.nativeElement);
        nv = nv || defaultTreeIconClass;
        ov = ov || defaultTreeIconClass;
        $el.find('i.expanded').removeClass(ICON_CLASSES[ov].expanded).addClass(ICON_CLASSES[nv].expanded);
        $el.find('i.collapsed').removeClass(ICON_CLASSES[ov].collapsed).addClass(ICON_CLASSES[nv].collapsed);
    }

    private setNodeclasses(treeId, treeNode) {
        debugger;
        return treeNode.icon ? {add: [`${treeNode.icon}`]} : '';
    };

    private renderTree() {
        setting.view['nodeClasses'] = this.setNodeclasses;
        $.fn.zTree.init($("ul[wmTree]"), setting, this.nodes);
        $("ul[wmTree]")[0].style.cssText += 'list-style-type: none; padding-inline-start: 40px;';
        debugger;
    }
}
