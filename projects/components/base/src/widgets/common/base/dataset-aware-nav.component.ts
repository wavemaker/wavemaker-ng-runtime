import {Injector, Optional} from '@angular/core';

import { Subject } from 'rxjs';

import {$appDigest, findValueOf, isObject, isDefined, validateAccessRoles} from '@wm/core';
import { SecurityService } from '@wm/security';

import { createArrayFrom } from '../../../utils/data-utils';
import { getEvaluatedData } from '../../../utils/widget-utils';
import { getOrderedDataset } from '../../../utils/form-utils';
import { StylableComponent } from './stylable.component';
import {debounce, first, get, isUndefined, omitBy, startsWith} from "lodash-es";

const getValidLink = (link) => {
    const routRegex = /^(\/|#\/|#)(?!\W).*/;
    if (link) {
        if (routRegex.test(link)) {
            link = first(link.match(/[\w]+.*/g)) || '';
            return `#/${link}`;
        }
        if (startsWith(link, 'www.')) {
            return `//${link}`;
        }
        return link;
    }
};

export class DatasetAwareNavComponent extends StylableComponent {

    public nodes: Array<NavNode> = [];
    public dataset: any;
    public itemicon: string;
    public itemlabel: string;
    public itemlink: string;
    public itemtarget: string;
    public itembadge: string;
    public itemchildren: string;
    public itemaction: string;
    public itemclass: string;
    public itemid: string;
    public isactive: string;
    public userrole: string;
    public orderby: string;
    public datafield: string;
    public displayfield: string;

    private _itemFieldMap;
    private binditemlabel: string | null;
    private binditemicon: string | null;
    private binditemaction: string | null;
    private binditembadge: string | null;
    private binditemchildren: string | null;
    private binditemlink: string | null;
    private binditemtarget: string | null;
    private binduserrole: string | null;
    private bindisactive: string | null;
    private securityService: any;

    protected binditemid: string | null;
    protected nodes$ = new Subject();

    constructor(inj: Injector, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);
        this.securityService = this.inj.get(SecurityService);
        this.binditemlabel = this.nativeElement.getAttribute('itemlabel.bind');
        this.binditemicon = this.nativeElement.getAttribute('itemicon.bind');
        this.binditemaction = this.nativeElement.getAttribute('itemaction.bind');
        this.binditembadge = this.nativeElement.getAttribute('itembadge.bind');
        this.binditemchildren = this.nativeElement.getAttribute('itemchildren.bind');
        this.binditemid = this.nativeElement.getAttribute('itemid.bind');
        this.binditemlink = this.nativeElement.getAttribute('itemlink.bind');
        this.binditemtarget = this.nativeElement.getAttribute('itemtarget.bind');
        this.binduserrole = this.nativeElement.getAttribute('userrole.bind');
        this.bindisactive = this.nativeElement.getAttribute('isactive.bind');
    }

    /**
     * constructs individual node for the widget model.
     * @param fields
     * @param node
     */
    private getNode(fields, node): NavNode {
        const context = this.viewParent.pageScope || this.viewParent;
        const children = getEvaluatedData(node, {
            field: this.itemchildren,
            bindExpression: this.binditemchildren
        }, context) || get(node, fields.childrenField);
        const navNode = {
            action: getEvaluatedData(node, {
                field: this.itemaction,
                bindExpression: this.binditemaction
            }, context) || get(node, fields.actionField),
            badge: getEvaluatedData(node, {
                field: this.itembadge,
                bindExpression: this.binditembadge
            }, context) || get(node, fields.badgeField),
            children: Array.isArray(children) ? this.getNodes(children) : [],
            class: get(node, fields.classField),
            disabled: node.disabled,
            icon: getEvaluatedData(node, {
                field: this.itemicon,
                bindExpression: this.binditemicon
            }, context) || get(node, fields.iconField),
            id: getEvaluatedData(node, {
                field: this.itemid,
                bindExpression: this.binditemid
            }, context) || get(node, fields.idField),
            label: getEvaluatedData(node, {
                field: this.itemlabel,
                bindExpression: this.binditemlabel
            }, context) || get(node, fields.labelField),
            link: getValidLink(getEvaluatedData(node, {
                field: this.itemlink,
                bindExpression: this.binditemlink
            }, context) || get(node, fields.linkField)),
            target: getValidLink(getEvaluatedData(node, {
                field: this.itemtarget,
                bindExpression: this.binditemtarget
            }, context) || get(node, fields.targetField)),
            role: getEvaluatedData(node, {field: this.userrole, bindExpression: this.binduserrole}, context),
            isactive: getEvaluatedData(node, {field: this.isactive, bindExpression: this.bindisactive}, context),
            // older projects have display field & data field property for menu.
            value: this.datafield ? (this.datafield === 'All Fields' ? node : findValueOf(node, this.datafield)) : node
        };
        // @ts-ignore
        return omitBy(navNode, isUndefined);
    }

    resetItemFieldMap() {
        this._itemFieldMap = null;
    }

    getItemFieldsMap() {
        if (!this._itemFieldMap) {
            this._itemFieldMap = {
                idField: this.itemid || 'itemid',
                iconField: this.itemicon || 'icon',
                labelField: this.itemlabel || 'label',
                linkField: this.itemlink || 'link',
                targetField: this.itemtarget || 'target',
                badgeField: this.itembadge || 'badge',
                childrenField: this.itemchildren || 'children',
                classField: this.itemclass || 'class',
                actionField: this.itemaction || 'action',
                isactiveField: this.isactive || 'isactive'
            };
        }
        return this._itemFieldMap;
    }

    /**
     * returns array for the value passed as nv.
     * nv: 'a,b' => [{label:a, value:a}, {label:b, value:b}]
     * nv: [1,2] => [{label:1, value:1}, {label:2, value:2}]
     * nv: [{obj}, {obj}] => [{obj}, {obj}]
     * @param nv
     */
    private prepareNodeDataSet(nv) {
        nv =  createArrayFrom(nv);
        return nv.map((val) => {
           if (!isObject(val)) {
                return {
                    label: val,
                    value: val
                };
           }
           return val;
        });
    }

    /**
     * constructs dataset form the nav elements.
     */
    private getNodes(nv = this.dataset || {}): Array<NavNode> {
        let nodes: Array<any> = getOrderedDataset(this.prepareNodeDataSet(nv), this.orderby) || [];

        if (nodes.length) {
            const userRole = this.userrole;
            const nodeFields = this.getItemFieldsMap();

            nodes = nodes.reduce((result, node) => {
                if (validateAccessRoles(node[userRole], this.securityService.loggedInUser)) {
                    result.push(this.getNode(nodeFields, node));
                }
                return result;
            }, []);
        }
        return nodes;
    }

    // enable the inherited class to extend this method.
    protected resetNodes() {
        this.resetItemFieldMap();
        this.nodes = this.getNodes();
        $appDigest();
        // notify the node listeners
        this.nodes$.next(null);
    }

    // debounce function for reset nodes functions.
    private _resetNodes = debounce(this.resetNodes, 50);

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'dataset':
            case 'itemicon':
            case 'itemlabel':
            case 'itemlink':
            case 'itemtarget':
            case 'itemclass':
            case 'itemchildren':
            case 'isactive':
            case 'orderby':
                // calls resetnodes method after 50ms. any calls within 50ms will be ignored.
                this._resetNodes();
                break;
        }
        super.onPropertyChange(key, nv, ov);
    }
}

export interface NavNode {
    label: string;
    action?: any;
    badge?: string;
    children?: Array<NavNode>;
    class?: string;
    disabled?: boolean;
    icon?: string;
    id?: string;
    link?: string;
    role?: string;
    value?: any;
}
